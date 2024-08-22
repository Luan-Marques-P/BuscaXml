using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

public class Startup
{
    [DllImport("C:\\temp\\projetos\\node\\buscaXml\\backend\\outros\\bin\\MT\\StdCall\\ACBrNFe64.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
    public static extern int NFE_DistribuicaoDFePorUltNSU(
        int cUFAutor, string eCNPJCPF, string eultNSU, StringBuilder sResposta, ref int esTamanho);

    [DllImport("C:\\temp\\projetos\\node\\buscaXml\\backend\\outros\\bin\\MT\\StdCall\\ACBrNFe64.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
    public static extern int NFE_UltimoRetorno(StringBuilder sResposta, ref int esTamanho);

    public async Task<object> Invoke(dynamic input)
    {
        try
        {
            Console.WriteLine("Estabelecendo conexão com a Receita...");
   

            Console.WriteLine("Conexão estabelecida com sucesso.");

            int cUFAutor = (int)input.uf;
            string eCNPJCPF = (string)input.cnpj;
            string eultNSU = (string)input.ultNSU;

            Console.WriteLine("Consultando para o CNPJ: " + eCNPJCPF + ", UF: " + cUFAutor.ToString() + ", Último NSU: " + eultNSU);

            StringBuilder sResposta = new StringBuilder(8192);
            int esTamanho = sResposta.Capacity;

            Console.WriteLine("Iniciando chamada para a DLL...");
            int result = NFE_DistribuicaoDFePorUltNSU(cUFAutor, eCNPJCPF, eultNSU, sResposta, ref esTamanho);
            Console.WriteLine("Resultado da chamada da DLL: " + result.ToString());

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
        catch (Exception ex)
        {
            Console.WriteLine("Erro durante a execução: " + ex.Message);
            return new { Result = -1, Resposta = "Erro durante a execução: " + ex.Message };
        }
    }
}
