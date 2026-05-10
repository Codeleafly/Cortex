use nox_shared::Opcode;
use crate::vm::{VMState, StackValue};
use std::collections::HashMap;

pub async fn execute_network(opcode: Opcode, state: &mut VMState) -> bool {
    match opcode {
        Opcode::HTTP_GET => {
            let url_val = state.pop();
            if let StackValue::String(url) = url_val {
                let client = reqwest::Client::new();
                let res = client.get(url).send().await;
                match res {
                    Ok(resp) => {
                        let status = resp.status().as_u16() as i64;
                        let text = resp.text().await.unwrap_or_default();
                        let mut dict = HashMap::new();
                        dict.insert("status".to_string(), StackValue::Number(status));
                        dict.insert("body".to_string(), StackValue::String(text));
                        state.push(StackValue::Dictionary(dict));
                    }
                    Err(e) => {
                        let mut dict = HashMap::new();
                        dict.insert("error".to_string(), StackValue::String(e.to_string()));
                        state.push(StackValue::Dictionary(dict));
                    }
                }
            } else {
                panic!("HTTP_GET requires string URL");
            }
            true
        }
        Opcode::JSON_PARSE => {
            let s_val = state.pop();
            if let StackValue::String(s) = s_val {
                let v: serde_json::Value = serde_json::from_str(&s).unwrap_or(serde_json::Value::Null);
                state.push(json_to_stack(v));
            } else {
                state.push(StackValue::Null);
            }
            true
        }
        Opcode::JSON_STR => {
            let val = state.pop();
            let s = serde_json::to_string(&stack_to_json(val)).unwrap_or_default();
            state.push(StackValue::String(s));
            true
        }
        Opcode::OS_INFO => {
            let mut dict = HashMap::new();
            dict.insert("os".to_string(), StackValue::String(std::env::consts::OS.to_string()));
            dict.insert("arch".to_string(), StackValue::String(std::env::consts::ARCH.to_string()));
            state.push(StackValue::Dictionary(dict));
            true
        }
        _ => false,
    }
}

fn json_to_stack(v: serde_json::Value) -> StackValue {
    match v {
        serde_json::Value::Number(n) => StackValue::Number(n.as_i64().unwrap_or(0)),
        serde_json::Value::String(s) => StackValue::String(s),
        serde_json::Value::Bool(b) => StackValue::Boolean(b),
        serde_json::Value::Array(_) => {
             StackValue::Null
        }
        serde_json::Value::Object(map) => {
            let mut dict = HashMap::new();
            for (k, v) in map {
                dict.insert(k, json_to_stack(v));
            }
            StackValue::Dictionary(dict)
        }
        serde_json::Value::Null => StackValue::Null,
    }
}

fn stack_to_json(v: StackValue) -> serde_json::Value {
    match v {
        StackValue::Number(n) => serde_json::Value::Number(n.into()),
        StackValue::String(s) => serde_json::Value::String(s),
        StackValue::Boolean(b) => serde_json::Value::Bool(b),
        StackValue::Dictionary(dict) => {
            let mut map = serde_json::Map::new();
            for (k, v) in dict {
                map.insert(k, stack_to_json(v));
            }
            serde_json::Value::Object(map)
        }
        _ => serde_json::Value::Null,
    }
}
