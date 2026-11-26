# ---------- Endereços públicos ----------

output "url_frontend" {
  description = "Endereço do site."
  value       = "http://${aws_eip.frontend.public_ip}:3000"
}

output "url_api" {
  description = "Endereço da API, usado pelo frontend no NEXT_PUBLIC_API_URL."
  value       = "http://${aws_eip.backend.public_ip}:3001"
}

# ---------- Endereços internos ----------

output "ip_privado_banco" {
  description = "IP do PostgreSQL dentro da VPC, usado pelo backend no DATABASE_URL."
  value       = aws_instance.banco.private_ip
}

# ---------- Instâncias ----------

output "ids_instancias" {
  description = "Ids das instâncias, usados para acessar e fazer deploy via SSM."
  value = {
    frontend = aws_instance.frontend.id
    backend  = aws_instance.backend.id
    banco    = aws_instance.banco.id
  }
}

# ---------- Imagens ----------

output "repositorios_ecr" {
  description = "URLs dos repositórios ECR, usadas pela CI para enviar as imagens e pelo deploy para baixá-las."
  value = {
    frontend = aws_ecr_repository.frontend.repository_url
    backend  = aws_ecr_repository.backend.repository_url
  }
}
