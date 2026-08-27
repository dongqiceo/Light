#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="${1:-${ROOT_DIR}/light-deployment.tar}"
OUTPUT_FILE="$(readlink -m "${OUTPUT_FILE}")"
OUTPUT_DIR="$(dirname "${OUTPUT_FILE}")"
STAGE_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${STAGE_DIR}"
}
trap cleanup EXIT

cd "${ROOT_DIR}"

for command in tar; do
  if ! command -v "${command}" >/dev/null 2>&1; then
    echo "错误：未找到命令 ${command}" >&2
    exit 1
  fi
done

if command -v docker >/dev/null 2>&1; then
  DOCKER=(docker)
  if "${DOCKER[@]}" compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
  else
    echo "错误：Docker Compose 不可用" >&2
    exit 1
  fi
elif command -v docker-compose >/dev/null 2>&1; then
  echo "错误：未找到 docker 命令，无法导出镜像" >&2
  exit 1
else
  echo "错误：未找到 docker 或 docker-compose 命令" >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"

if [[ -e "${OUTPUT_FILE}" ]]; then
  rm -f "${OUTPUT_FILE}"
fi

printf '%s\n' '正在构建全部 Docker 镜像...'
"${COMPOSE[@]}" build

printf '%s\n' '正在导出 Docker 镜像...'
docker save \
  --output "${STAGE_DIR}/images.tar" \
  light-backend:latest \
  light-web:latest \
  light-cms:latest

printf '%s\n' '正在打包镜像和运行数据...'
tar -cf "${OUTPUT_FILE}" \
  -C "${STAGE_DIR}" images.tar \
  -C "${ROOT_DIR}" \
  service-java/light/public \
  service-java/data \
  docker-compose.yml

printf '打包完成：%s\n' "${OUTPUT_FILE}"
printf '%s\n' '恢复镜像：tar -xf light-deployment.tar images.tar && docker load -i images.tar'
