use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct PackageMap {
    pub name: String,
    pub version: String,
    pub main: String,
    pub files: Option<HashMap<String, String>>,
    pub dependencies: Option<HashMap<String, String>>,
}

pub struct ModuleResolver {
    pub cache_dir: PathBuf,
}

impl ModuleResolver {
    pub fn new() -> Self {
        let home = home::home_dir().unwrap_or_else(|| PathBuf::from("."));
        let cache_dir = home.join(".nox_libx").join("pkg_cache");
        if !cache_dir.exists() {
            fs::create_dir_all(&cache_dir).unwrap();
        }
        Self { cache_dir }
    }

    pub async fn resolve(&self, source: &str) -> Result<PathBuf, String> {
        if source.starts_with("nox:") {
             let mod_name = &source[4..];
             let path = PathBuf::from("std").join(mod_name).join("mod.nx");
             if path.exists() {
                 return Ok(path);
             }
        }
        if source.starts_with("./") || source.starts_with("../") || source.starts_with("/") {
            let path = PathBuf::from(source);
            if path.exists() {
                if path.extension().and_then(|s| s.to_str()) == Some("json") {
                    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
                    let map: PackageMap = serde_json::from_str(&content).map_err(|e| e.to_string())?;
                    let parent = path.parent().unwrap_or(Path::new("."));
                    return Ok(parent.join(map.main));
                }
                return Ok(path);
            }
            return Err(format!("Local module not found: {}", source));
        }

        if source.starts_with("http://") || source.starts_with("https://") || source.starts_with("github:") {
            return self.resolve_remote(source).await;
        }

        Err(format!("Unsupported module source: {}", source))
    }

    async fn resolve_remote(&self, source: &str) -> Result<PathBuf, String> {
        let mut url = if source.starts_with("github:") {
            let parts: Vec<&str> = source["github:".len()..].split('/').collect();
            if parts.len() < 2 {
                return Err("Invalid github source. Use github:user/repo".to_string());
            }
            format!("https://raw.githubusercontent.com/{}/{}/main/map.nx.json", parts[0], parts[1])
        } else {
            source.to_string()
        };

        if !url.ends_with(".json") && !url.ends_with(".nx") {
             // Default to map.nx.json if it's just a folder-like URL
             if !url.ends_with("/") { url.push('/'); }
             url.push_str("map.nx.json");
        }

        let hash = format!("{:x}", md5::compute(&url));
        let pkg_path = self.cache_dir.join(&hash);

        if pkg_path.exists() {
            let map_file = pkg_path.join("map.nx.json");
            if map_file.exists() {
                 let content = fs::read_to_string(&map_file).map_err(|e| e.to_string())?;
                 let map: PackageMap = serde_json::from_str(&content).map_err(|e| e.to_string())?;
                 // Real path might be in a versioned folder if we were fancy,
                 // but hash-based is fine for alpha.
                 return Ok(pkg_path.join(map.main));
            } else if pkg_path.is_file() {
                 return Ok(pkg_path);
            }
        }

        println!("[Nox] Module not found locally. Downloading from {}...", url);

        if url.ends_with(".nx") {
             // Direct file download
             let client = reqwest::Client::new();
             let resp = client.get(&url).send().await.map_err(|e| e.to_string())?;
             let content = resp.bytes().await.map_err(|e| e.to_string())?;
             fs::write(&pkg_path, content).map_err(|e| e.to_string())?;
             return Ok(pkg_path);
        }

        self.download_package(&url, &pkg_path).await?;

        let map_file = pkg_path.join("map.nx.json");
        let content = fs::read_to_string(&map_file).map_err(|e| e.to_string())?;
        let map: PackageMap = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        Ok(pkg_path.join(map.main))
    }

    async fn download_package(&self, url: &str, dest: &Path) -> Result<(), String> {
        fs::create_dir_all(dest).map_err(|e| e.to_string())?;

        let client = reqwest::Client::new();
        let resp = client.get(url).send().await.map_err(|e| e.to_string())?;
        let content = resp.text().await.map_err(|e| e.to_string())?;

        let map_file = dest.join("map.nx.json");
        fs::write(&map_file, &content).map_err(|e| e.to_string())?;

        let map: PackageMap = serde_json::from_str(&content).map_err(|e| e.to_string())?;

        if let Some(files) = map.files {
            for (local_path, remote_url) in files {
                let file_dest = dest.join(local_path);
                if let Some(parent) = file_dest.parent() {
                    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
                let file_resp = client.get(remote_url).send().await.map_err(|e| e.to_string())?;
                let file_content = file_resp.bytes().await.map_err(|e| e.to_string())?;
                fs::write(file_dest, file_content).map_err(|e| e.to_string())?;
            }
        }

        Ok(())
    }
}
