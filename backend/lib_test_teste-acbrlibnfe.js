const path = require('path');
const ffi = require('ffi-napi');
const ref = require('ref-napi');
const fs = require('fs');
const readline = require('readline');

// Caminho para a DLL do ACBr
const pathDllACBrLibNFe = path.join(__dirname, 'outros', 'bin', 'MT', 'StdCall', 'ACBrNFe64.dll');
const eArqConfig = ''; 
const eChaveCrypt = '';

// Função assíncrona para consultar NFe
async function consultarDFe(cnpj) {
  // Carrega a biblioteca com todos os métodos necessários
  const libm = ffi.Library(pathDllACBrLibNFe, {
    // Inicializar e Finalizar
    NFE_Inicializar: ['int', ['string', 'string']],
    NFE_Finalizar: ['int', []],
    NFE_UltimoRetorno: ['int', [ref.refType('char'), ref.refType('int')]],
    NFE_ConfigGravarValor: ['int', ['string', 'string', 'string']],

    // Métodos de Distribuição DFe
    NFE_DistribuicaoDFePorUltNSU: ['int', ['int', 'string', 'string', ref.refType('char'), ref.refType('int')]],
    NFE_DistribuicaoDFePorNSU: ['int', ['int', 'string', 'string', ref.refType('char'), ref.refType('int')]],
    NFE_DistribuicaoDFePorChave: ['int', ['int', 'string', 'string', ref.refType('char'), ref.refType('int')]],

    // Métodos NFe adicionais
    NFE_Assinar: ['int', []],
    NFE_Validar: ['int', []],
    NFE_ObterXml: ['int', ['int', ref.refType('char'), ref.refType('int')]],
    NFE_GravarXml: ['int', ['int', 'string', 'string']],
    NFE_Consultar: ['int', ['string', 'bool', ref.refType('char'), ref.refType('int')]],
    NFE_Enviar: ['int', ['int', 'bool', 'bool', 'bool', ref.refType('char'), ref.refType('int')]],
    NFE_Cancelar: ['int', ['string', 'string', 'string', 'int', ref.refType('char'), ref.refType('int')]],
    NFE_Inutilizar: ['int', ['string', 'string', 'int', 'int', 'int', 'int', 'int', ref.refType('char'), ref.refType('int')]],
    NFE_EnviarEmail: ['int', ['string', 'string', 'bool', 'string', 'string', 'string', 'string']],
    NFE_EnviarEmailEvento: ['int', ['string', 'string', 'string', 'bool', 'string', 'string', 'string', 'string']],
    NFE_Imprimir: ['int', ['string', 'int', 'string', 'string', 'string', 'string', 'string']],
    NFE_ImprimirPDF: ['int', []],
    NFE_SalvarPDF: ['int', [ref.refType('char'), ref.refType('int')]],
    NFE_ImprimirEvento: ['int', ['string', 'string']],
    NFE_ImprimirEventoPDF: ['int', ['string', 'string']],
    NFE_SalvarEventoPDF: ['int', ['string', 'string']],
    NFE_ImprimirInutilizacao: ['int', ['string']],
    NFE_ImprimirInutilizacaoPDF: ['int', ['string']],
    NFE_SalvarInutilizacaoPDF: ['int', ['string']],
  });

  const certificadoPath = path.join(__dirname, 'certificado', 'Certificado.pfx');
  const senhaCertificado = 'SenhaDoCertificado';

  let inicio = libm.NFE_Inicializar(eArqConfig, eChaveCrypt);
  console.log(`Inicializou: ${inicio}`);

  if (inicio === 0) {
    libm.NFE_ConfigGravarValor('DFe', 'ArquivoPFX', certificadoPath);
    libm.NFE_ConfigGravarValor('DFe', 'Senha', senhaCertificado);
    libm.NFE_ConfigGravarValor('NFe', 'PathSchemas', path.join(__dirname, 'outros', 'dep', 'Schemas', 'NFe'));
    console.log('Configurações do certificado aplicadas.');


    const cUFAutor = 35;
    const eultNSU = '000000000000000';
    const bufferLength = 65536;
    const sResposta = Buffer.alloc(bufferLength);
    const esTamanho = ref.alloc('int', bufferLength);

    inicio = libm.NFE_DistribuicaoDFePorUltNSU(cUFAutor, cnpj, eultNSU, sResposta, esTamanho);
    console.log(`Resultado da consulta: ${inicio}`);

    if (inicio === 0) {
      console.log('Resposta da consulta:', sResposta.toString('utf8'));
      const filePath = path.join(__dirname, 'downloads', `DFe_${cnpj}.xml`);
      fs.writeFileSync(filePath, sResposta.toString('utf8'));
      console.log(`XML salvo em: ${filePath}`);
    } else {
      libm.NFE_UltimoRetorno(sResposta, esTamanho);
      console.error('Erro na consulta:', sResposta.toString('utf8'));
    }

    libm.NFE_Finalizar();
    console.log('Finalizou a operação.');
  } else {
    console.error('Erro ao inicializar a biblioteca.');
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Digite o CNPJ para consultar: ', (cnpj) => {
  consultarDFe(cnpj);
  rl.close();
});

module.exports = { consultarDFe };
