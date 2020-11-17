# SimplesRA
Uma pequena brincadeira utilizando haar cascades em ambiente PureJS.


Este projeto utiliza como base uma biblioteca open source para o processamento da detecção de objetos.
O projeto foi baseado na versão demo de detecção de objetos do framework.

		Jsfeat
		https://inspirit.github.io/jsfeat/
		https://inspirit.github.io/jsfeat/sample_haar_face.html
		
		
	Este projeto requer condições especiais para poder rodar.
	Não pode rodar direto do sistema de arquivos, pois as restrições de CORS impedirão a correta carga das imagens dos chapéus diretamente do sistema de 
arquivos.
	Requer um servidor seguro local para poder executar corretamente. 
	Nos testes utilizei um servidor XAMPP(servidor Apache) local.
	Para rodar em servidores publicados na web requer suporte HTTPS.
	Se não atender às restrições de segurança o próprio navegador impede o acesso à camera.
	Observando que mesmo dentro de um ambiente seguro, é necessária a permissão do usuário para liberar o acesso à câmera.
	
	
	Demo funcional em: www.wind.net.br/simplesRaWeb
	
	---->>> IPC!!!! <<<----
	Para conseguir rodar em um servidor IIS VPS foi necessário ativar o HTTPS com um certificado válido de terceiros. 
	Foi preciso gerar um certificado (free) em https://www.sslforfree.com. Não serviu certificado autoassinado.
	Converter para o padrão do IIS com o OpenSSL e habilitar no domínio.
	Foi preciso também uma pequena gambiarra utilizando o “compability.js”.