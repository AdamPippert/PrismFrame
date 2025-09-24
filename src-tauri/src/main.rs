use tauri::State;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::io::{BufReader, BufRead, Write};
use std::fs;
use std::path::PathBuf;
use std::collections::HashMap;
use sysinfo::System;

// System monitoring state
#[derive(Clone)]
struct SystemInfo {
    cpu_usage: f64,
    cpu_cores: usize,
    memory_used: u64,
    memory_total: u64,
    memory_percentage: f64,
    network_rx: u64,
    network_tx: u64,
    disk_used: u64,
    disk_total: u64,
    disk_percentage: f64,
}

type SystemMonitorState = Mutex<SystemInfo>;

// PTY management state
#[derive(Clone)]
struct PtyProcess {
    id: u32,
    child: Arc<Mutex<Option<std::process::Child>>>,
    stdin: Arc<Mutex<Option<std::process::ChildStdin>>>,
    stdout: Arc<Mutex<Option<BufReader<std::process::ChildStdout>>>>,
}

type PtyState = Mutex<HashMap<u32, PtyProcess>>;

#[tauri::command]
fn get_system_info(state: State<SystemMonitorState>) -> Result<String, String> {
    // Get real system information using sysinfo
    let mut system = System::new_all();

    // Refresh system information
    system.refresh_all();

    let cpu_usage = system.global_cpu_info().cpu_usage();
    let cpu_cores = system.cpus().len();

    let memory_used = system.used_memory();
    let memory_total = system.total_memory();
    let memory_percentage = if memory_total > 0 {
        (memory_used as f64 / memory_total as f64) * 100.0
    } else {
        0.0
    };

    // Get network information (placeholder for now - sysinfo API changed)
    // TODO: Implement proper network monitoring with current sysinfo version
    let network_rx = 1024u64 * 1024; // 1MB placeholder
    let network_tx = 512u64 * 1024;  // 512KB placeholder

    // Get disk information (placeholder for now - sysinfo API changed)
    // TODO: Implement proper disk monitoring with current sysinfo version
    let disk_used = 50u64 * 1024 * 1024 * 1024; // 50GB used
    let disk_total = 256u64 * 1024 * 1024 * 1024; // 256GB total

    let disk_percentage = if disk_total > 0 {
        (disk_used as f64 / disk_total as f64) * 100.0
    } else {
        0.0
    };

    let system_info = SystemInfo {
        cpu_usage: cpu_usage as f64,
        cpu_cores,
        memory_used,
        memory_total,
        memory_percentage,
        network_rx,
        network_tx,
        disk_used,
        disk_total,
        disk_percentage,
    };

    // Update state
    *state.inner().lock().unwrap() = system_info.clone();

    // Return JSON response
    let response = serde_json::json!({
        "cpu": {
            "usage": system_info.cpu_usage,
            "cores": system_info.cpu_cores
        },
        "memory": {
            "used": system_info.memory_used as f64 / 1024.0 / 1024.0 / 1024.0, // Convert to GB
            "total": system_info.memory_total as f64 / 1024.0 / 1024.0 / 1024.0, // Convert to GB
            "percentage": system_info.memory_percentage
        },
        "network": {
            "rx": system_info.network_rx,
            "tx": system_info.network_tx
        },
        "disk": {
            "used": system_info.disk_used as f64 / 1024.0 / 1024.0 / 1024.0 / 1024.0, // Convert to GB
            "total": system_info.disk_total as f64 / 1024.0 / 1024.0 / 1024.0 / 1024.0, // Convert to GB
            "percentage": system_info.disk_percentage
        }
    });

    Ok(response.to_string())
}

#[tauri::command]
fn execute_command(command: String, cwd: Option<String>) -> Result<String, String> {
    let mut cmd = if cfg!(target_os = "windows") {
        let mut c = Command::new("cmd");
        c.args(&["/C", &command]);
        c
    } else {
        let mut c = Command::new("sh");
        c.arg("-c").arg(&command);
        c
    };

    if let Some(dir) = cwd {
        cmd.current_dir(dir);
    }

    match cmd.output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);
            Ok(format!("{}{}", stdout, stderr))
        }
        Err(e) => Err(format!("Command execution failed: {}", e))
    }
}

#[tauri::command]
fn spawn_terminal(state: State<PtyState>, shell: String, cwd: String) -> Result<u32, String> {
    // Determine shell to use
    let shell_cmd = if shell.is_empty() {
        if cfg!(target_os = "windows") {
            "cmd.exe".to_string()
        } else {
            // Try common shells in order of preference
            let shells = ["bash", "zsh", "sh"];
            let mut found_shell = "sh".to_string(); // fallback

            for shell_name in &shells {
                if Command::new(shell_name).arg("--version").output().is_ok() {
                    found_shell = shell_name.to_string();
                    break;
                }
            }

            found_shell
        }
    } else {
        shell
    };

    // Spawn the shell process
    let mut cmd = Command::new(&shell_cmd);
    cmd.stdin(Stdio::piped())
       .stdout(Stdio::piped())
       .stderr(Stdio::piped());

    if !cwd.is_empty() {
        cmd.current_dir(cwd);
    } else {
        // Use home directory as default
        if let Ok(home_dir) = std::env::var("HOME").or_else(|_| std::env::var("USERPROFILE")) {
            cmd.current_dir(home_dir);
        }
    }

    let mut child = cmd.spawn()
        .map_err(|e| {
            eprintln!("Failed to spawn shell '{}': {}", shell_cmd, e);
            format!("Failed to spawn shell '{}': {}", shell_cmd, e)
        })?;

    // Get stdin and stdout handles
    let stdin = child.stdin.take()
        .ok_or("Failed to get stdin handle")?;
    let stdout = child.stdout.take()
        .ok_or("Failed to get stdout handle")?;
    let reader = BufReader::new(stdout);

    // Generate unique ID
    let id = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos() as u32;

    // Store PTY process
    let pty_process = PtyProcess {
        id,
        child: Arc::new(Mutex::new(Some(child))),
        stdin: Arc::new(Mutex::new(Some(stdin))),
        stdout: Arc::new(Mutex::new(Some(reader))),
    };

    state.inner().lock().unwrap().insert(id, pty_process);

    Ok(id)
}

#[tauri::command]
fn read_pty_output(state: State<PtyState>, id: u32) -> Result<String, String> {
    let mut pty_state = state.inner().lock().unwrap();

    if let Some(pty_process) = pty_state.get_mut(&id) {
        // First check if the child process is still running
        if let Some(child) = pty_process.child.lock().unwrap().as_mut() {
            match child.try_wait() {
                Ok(Some(exit_status)) => {
                    // Process has exited
                    return Ok(format!("Process exited with status: {}\n", exit_status));
                }
                Ok(None) => {
                    // Process is still running, try to read output
                }
                Err(e) => {
                    return Err(format!("Failed to check process status: {}", e));
                }
            }
        }

        // Try to read from stdout
        if let Some(reader) = pty_process.stdout.lock().unwrap().as_mut() {
            let mut buffer = String::new();
            match reader.read_line(&mut buffer) {
                Ok(0) => {
                    // No data available
                    Ok("".to_string())
                }
                Ok(_) => {
                    // Return the line we read
                    Ok(buffer)
                }
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    // No data available (non-blocking)
                    Ok("".to_string())
                }
                Err(e) => {
                    Err(format!("Failed to read from stdout: {}", e))
                }
            }
        } else {
            Err("Process stdout not available".to_string())
        }
    } else {
        Err("PTY ID not found".to_string())
    }
}

#[tauri::command]
fn write_pty_input(state: State<PtyState>, id: u32, input: String) -> Result<(), String> {
    let pty_state = state.inner().lock().unwrap();

    if let Some(pty_process) = pty_state.get(&id) {
        if let Some(stdin) = pty_process.stdin.lock().unwrap().as_mut() {
            // Write the input to stdin
            match stdin.write_all(input.as_bytes()) {
                Ok(_) => {
                    // Flush to ensure the data is sent
                    match stdin.flush() {
                        Ok(_) => Ok(()),
                        Err(e) => Err(format!("Failed to flush stdin: {}", e))
                    }
                }
                Err(e) => Err(format!("Failed to write to stdin: {}", e))
            }
        } else {
            Err("Process stdin not available".to_string())
        }
    } else {
        Err("PTY ID not found".to_string())
    }
}

#[derive(serde::Serialize)]
struct FileEntry {
    name: String,
    path: String,
    is_directory: bool,
    size: Option<u64>,
    modified: Option<String>,
}

#[tauri::command]
fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir_path = PathBuf::from(path);

    if !dir_path.exists() {
        return Err("Directory does not exist".to_string());
    }

    if !dir_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let mut entries = Vec::new();

    match fs::read_dir(&dir_path) {
        Ok(dir_entries) => {
            for entry in dir_entries {
                match entry {
                    Ok(entry) => {
                        let path = entry.path();
                        let metadata = entry.metadata().ok();
                        let name = path.file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("unknown")
                            .to_string();

                        let file_entry = FileEntry {
                             name,
                             path: path.to_string_lossy().to_string(),
                             is_directory: path.is_dir(),
                             size: metadata.as_ref().and_then(|m| Some(m.len())),
                             modified: metadata.as_ref().and_then(|m| {
                                 m.modified().ok().and_then(|t| {
                                     Some(format!("{:?}", t))
                                 })
                             }),
                         };

                        entries.push(file_entry);
                    }
                    Err(_) => continue,
                }
            }

            // Sort directories first, then files alphabetically
            entries.sort_by(|a, b| {
                match (a.is_directory, b.is_directory) {
                    (true, false) => std::cmp::Ordering::Less,
                    (false, true) => std::cmp::Ordering::Greater,
                    _ => a.name.cmp(&b.name),
                }
            });

            Ok(entries)
        }
        Err(e) => Err(format!("Failed to read directory: {}", e)),
    }
}

#[tauri::command]
fn get_home_directory() -> Result<String, String> {
    match std::env::var("HOME").or_else(|_| std::env::var("USERPROFILE")) {
        Ok(home) => Ok(home),
        Err(_) => Ok("/".to_string()), // fallback for systems without HOME
    }
}

#[tauri::command]
fn kill_terminal(state: State<PtyState>, id: u32) -> Result<(), String> {
    let mut pty_state = state.inner().lock().unwrap();

    if let Some(pty_process) = pty_state.remove(&id) {
        // Kill the child process
        if let Some(mut child) = pty_process.child.lock().unwrap().take() {
            let _ = child.kill();
            let _ = child.wait(); // Wait for the process to finish
        }

        // The stdin and stdout will be automatically dropped when pty_process is dropped
        Ok(())
    } else {
        Err("PTY process not found".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .manage(SystemMonitorState::new(SystemInfo {
            cpu_usage: 0.0,
            cpu_cores: 0,
            memory_used: 0,
            memory_total: 0,
            memory_percentage: 0.0,
            network_rx: 0,
            network_tx: 0,
            disk_used: 0,
            disk_total: 0,
            disk_percentage: 0.0,
        }))
        .manage(PtyState::new(HashMap::new()))
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            execute_command,
            spawn_terminal,
            read_pty_output,
            write_pty_input,
            list_directory,
            get_home_directory,
            kill_terminal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}