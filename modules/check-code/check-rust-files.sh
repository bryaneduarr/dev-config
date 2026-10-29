# shellcheck shell=bash
readonly RUST_EXTENSIONS=(rs)

check_rust_workspace() {
  local workspace="$1"
  run_check "cargo fmt $workspace" run_in_directory "$workspace" cargo fmt --all --check
  run_check "cargo clippy $workspace" run_in_directory "$workspace" cargo clippy --workspace --all-targets -- -D warnings
}

check_rust_files() {
  local -a rust_files
  local -a workspaces=()
  local file workspace
  mapfile -t rust_files < <(select_files_with_extensions "${RUST_EXTENSIONS[@]}")
  for file in "${rust_files[@]}"; do
    workspace=$(find_owning_directory Cargo.lock "$(dirname "$file")")
    if [[ -z $workspace ]]; then
      note_unchecked "$file has no Cargo.lock workspace"
    else
      workspaces+=("$workspace")
    fi
  done
  if ((${#workspaces[@]} == 0)); then
    return 0
  fi
  mapfile -t workspaces < <(printf '%s\n' "${workspaces[@]}" | sort -u)
  for workspace in "${workspaces[@]}"; do
    check_rust_workspace "$workspace"
  done
}
