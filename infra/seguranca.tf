# ---------- Frontend ----------

resource "aws_security_group" "frontend" {
  name        = "${var.projeto}-sg-frontend"
  description = "Permite acesso HTTP ao frontend Next.js"
  vpc_id      = aws_vpc.principal.id

  tags = {
    Name = "${var.projeto}-sg-frontend"
  }
}

resource "aws_vpc_security_group_ingress_rule" "frontend_http" {
  security_group_id = aws_security_group.frontend.id
  description       = "Next.js aberto para a internet"
  ip_protocol       = "tcp"
  from_port         = 3000
  to_port           = 3000
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "frontend_saida" {
  security_group_id = aws_security_group.frontend.id
  description       = "Saida liberada (imagens, pacotes e SSM)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# ---------- Backend ----------

resource "aws_security_group" "backend" {
  name        = "${var.projeto}-sg-backend"
  description = "Grupo de seguranca do Backend"
  vpc_id      = aws_vpc.principal.id

  tags = {
    Name = "${var.projeto}-sg-backend"
  }
}

resource "aws_vpc_security_group_ingress_rule" "backend_http" {
  security_group_id = aws_security_group.backend.id
  description       = "API aberta para a internet"
  ip_protocol       = "tcp"
  from_port         = 3001
  to_port           = 3001
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "backend_saida" {
  security_group_id = aws_security_group.backend.id
  description       = "Saida liberada (imagens, pacotes e SSM)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# ---------- Banco de dados ----------

resource "aws_security_group" "banco" {
  name        = "${var.projeto}-sg-banco"
  description = "Permite acesso ao PostgreSQL somente a partir do backend"
  vpc_id      = aws_vpc.principal.id

  tags = {
    Name = "${var.projeto}-sg-banco"
  }
}

resource "aws_vpc_security_group_ingress_rule" "banco_postgres" {
  security_group_id            = aws_security_group.banco.id
  description                  = "PostgreSQL acessivel apenas pelo backend"
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  referenced_security_group_id = aws_security_group.backend.id
}

resource "aws_vpc_security_group_egress_rule" "banco_saida" {
  security_group_id = aws_security_group.banco.id
  description       = "Saida liberada via NAT (imagens, pacotes e SSM)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}