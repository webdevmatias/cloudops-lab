import { Router } from 'express';
import { ClienteControlador } from '../controladores/cliente.controlador';
import { ClienteRepositorio } from '../repositorios/cliente.repositorio';
import { ClienteServico } from '../servicos/cliente.servico';

const repositorio = new ClienteRepositorio();
const servico = new ClienteServico(repositorio);
const controlador = new ClienteControlador(servico);

export const clienteRotas = Router();

clienteRotas.get('/', controlador.listar);
clienteRotas.get('/:id', controlador.obterPorId);
clienteRotas.post('/', controlador.criar);
clienteRotas.put('/:id', controlador.atualizar);
clienteRotas.delete('/:id', controlador.remover);
