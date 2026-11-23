# ---------- Frontend ----------

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.projeto}-frontend"
  image_tag_mutability = "MUTABLE"

  # Sem isso, o destroy falha se o repositório ainda tiver imagens
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.projeto}-frontend"
  }
}

# ---------- Backend ----------

resource "aws_ecr_repository" "backend" {
  name                 = "${var.projeto}-backend"
  image_tag_mutability = "MUTABLE"

  # Sem isso, o destroy falha se o repositório ainda tiver imagens
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.projeto}-backend"
  }
}
