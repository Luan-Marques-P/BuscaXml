const edge = require('edge-js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Função para consulta na DLL
const consultarNFe = edge.func({
    source: function () { /*
    using System;
    using System.Text;
    using System.Runtime.InteropServices;
    using System.Threading.Tasks;

    public class Startup
    {
        [DllImport("C:\\temp\\projetos\\node\\buscaXml\\backend\\outros\\bin\\MT\\StdCall\\ACBrNFe64.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
        public static extern int NFE_DistribuicaoDFePorUltNSU(int cUFAutor, string eCNPJCPF, string eultNSU, StringBuilder sResposta, ref int esTamanho);

        [DllImport("C:\\temp\\projetos\\node\\buscaXml\\backend\\outros\\bin\\MT\\StdCall\\ACBrNFe64.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
        public static extern int NFE_UltimoRetorno(StringBuilder sResposta, ref int esTamanho);

        public async Task<object> Invoke(dynamic input)
        {
            Console.WriteLine("Estabelecendo conexão com a Receita...");

            Console.WriteLine("Conexão estabelecida com sucesso.");
            
            int cUFAutor = (int)input.uf; // Código da UF recebido da requisição
            string eCNPJCPF = (string)input.cnpj; // CNPJ recebido da requisição
            string eultNSU = (string)input.ultNSU; // Último NSU recebido da requisição

            Console.WriteLine("Consultando para o CNPJ: " + eCNPJCPF + ", UF: " + cUFAutor.ToString() + ", Último NSU: " + eultNSU);

            StringBuilder sResposta = new StringBuilder(8192); // Aumenta o tamanho do buffer
            int esTamanho = sResposta.Capacity;

            Console.WriteLine("Iniciando chamada para a DLL...");
            int result = NFE_DistribuicaoDFePorUltNSU(cUFAutor, eCNPJCPF, eultNSU, sResposta, ref esTamanho);
            Console.WriteLine("Resultado da chamada da DLL: " + result.ToString()); // Log do resultado da chamada

            if (result != 0)
            {
                Console.WriteLine("Erro ao consultar a Receita. Obtendo detalhes do erro...");
                NFE_UltimoRetorno(sResposta, ref esTamanho);
                Console.WriteLine("Erro na consulta: " + sResposta.ToString());
            }
            else
            {
                Console.WriteLine("Consulta realizada com sucesso. Resposta: " + sResposta.ToString());
            }

            return new { Result = result, Resposta = sResposta.ToString() };
        }
    }*/ },
    references: []
});

// Middleware JSON
app.use(express.json());

app.post('/consultar-xml', (req, res) => {
    const { uf, cnpj, ultNSU } = req.body;

    if (!uf || !cnpj || !ultNSU) {
        return res.status(400).json({ error: 'Dados incompletos. Certifique-se de enviar uf, cnpj e ultNSU.' });
    }

    console.log("Consultando para o CNPJ: " + cnpj + ", UF: " + uf + ", Último NSU: " + ultNSU);

    consultarNFe({ uf, cnpj, ultNSU }, (error, result) => {
        console.log('Iniciando chamada para a DLL...');
        if (error) {
            console.error('Erro ao chamar a função da DLL:', error.message);
            return res.status(500).json({ error: error.message });
        }

        console.log('Resultado da DLL:', result);
        if (result.Result !== 0) {
            console.error('Erro na consulta: ' + result.Resposta);
            return res.status(400).json({ error: 'Erro na consulta: ' + result.Resposta });
        }

        if (!result.Resposta.trim()) {
            console.warn('Nenhum dado encontrado na resposta da consulta.');
            return res.status(400).json({ error: 'Nenhum dado encontrado na consulta. Tente novamente mais tarde.' });
        }

        const fileName = 'DFe_' + cnpj + '.xml';
        const filePath = path.join(__dirname, 'downloads', fileName);

        fs.writeFile(filePath, result.Resposta, (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo XML:', err);
                return res.status(500).json({ error: 'Erro ao salvar o arquivo XML.' });
            }
            res.json({ message: 'Arquivo XML salvo com sucesso.', filePath });
        });
    });
});

app.listen(port, () => {
    console.log("Servidor rodando em http://localhost:" + port);
});
