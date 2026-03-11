use regex::Regex;
use lazy_static::lazy_static;
use serde::Serialize;

lazy_static! {
    // We added a # after the r, and a # after the closing quote.
    // We also removed the backslash before the double quote inside the brackets.
    static ref RE_URL: Regex = Regex::new(r#"(?i)https?://[^\s"'<>\]},;]+"#).unwrap();
    static ref RE_APP: Regex = Regex::new(r"(?:[DIWEV]\s+([A-Za-z][A-Za-z0-9_.]{2,})\s*:|(com\.[a-zA-Z0-9_.]+))").unwrap();
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Packet {
    pub no: i32,
    pub time: String,
    pub app: String,
    pub proto: String,
    pub method: String,
    pub host: String,
    pub url: String,
    pub raw: String,
    pub risk: String,
}

pub fn parse_line(line: &str, seq: i32) -> Option<Packet> {
    if !RE_URL.is_match(line) && !line.contains("dns") && !line.contains("socket") {
        return None;
    }

    let url = RE_URL.find(line).map(|m| m.as_str().to_string()).unwrap_or_default();
    let host = url.split('/').nth(2).unwrap_or("").to_string();
    let app_pkg = RE_APP.captures(line)
        .and_then(|c| c.get(1).or(c.get(2)))
        .map(|m| m.as_str().to_string())
        .unwrap_or_else(|| "system".to_string());

    Some(Packet {
        no: seq,
        time: chrono::Local::now().format("%H:%M:%S%.3f").to_string(),
        app: app_pkg,
        proto: if url.contains("https") { "HTTPS".into() } else { "HTTP".into() },
        method: if line.contains("POST") { "POST".into() } else { "GET".into() },
        host,
        url,
        raw: line.to_string(),
        risk: if line.contains("tracker") || line.contains("ads") { "high".into() } else { "low".into() },
    })
}