const express = require('express');
const router = express.Router();

function ValidarCpf(cpf) {

    var Soma;
    var Resto;
    var strCPF;
	var strTemp;
    var i;
    Soma = 0;   

    strTemp = cpf.replace(".", "");
    strTemp = strTemp.replace(".", "");
    strTemp = strTemp.replace(".", "");
    strTemp = strTemp.replace("-", "");
    strTemp = strTemp.replace("-", "");
    strCPF = strTemp;
    if (cpf === '') {
        return false
    } else {
        if (strCPF == "00000000000")
        return false;
        for (i=1; i<=9; i++)
        Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i); 
        Resto = (Soma * 10) % 11;
        if ((Resto == 10) || (Resto == 11)) 
        Resto = 0;
        if (Resto != parseInt(strCPF.substring(9, 10)) )
        return false;
        Soma = 0;
        for (i = 1; i <= 10; i++)
           Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;
        if ((Resto == 10) || (Resto == 11)) 
        Resto = 0;
        if (Resto != parseInt(strCPF.substring(10, 11) ) )
            return false;
        return true;
    }

}

async function SituacaoCpf(cpf) {

    const chromium = require("chrome-aws-lambda");
    const puppeteer = require("puppeteer-core");
    const options = {
        args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
        defaultViewport: chromium.defaultViewport,  
        executablePath: await chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
    };
    browser = await chromium.puppeteer.launch(options);

    const page = await browser.newPage();
    const inputCpf = '#SE_NomeTituloCPF'
    const result = '#return-form-situacao-eleitoral > p:nth-child(2)'
    
    await page.goto('https://www.tse.jus.br/eleitor/titulo-e-local-de-votacao/copy_of_consulta-por-nome');
    await page.waitForSelector(inputCpf)
    await page.type(inputCpf, cpf, {delay:100})
    await page.waitForSelector(inputCpf)
    await page.keyboard.press('Enter')
    await page.waitForSelector(result)
    const situacao = await page.evaluate(() => {
        return document.querySelector('#return-form-situacao-eleitoral > p:nth-child(2)').textContent
    })
    
    await browser.close()
    return situacao
    
};

router.get('/', async function(req, res){
    res.json('Opnião Política API');
});

router.get('/cpf/:cpf', async function(req, res){

    let situacao
    const cpf = req.params.cpf
    const cpfValido = await ValidarCpf(cpf)
    if (cpfValido) {
        situacao = await SituacaoCpf(req.params.cpf)
    } else {
        situacao = 'CPF Inválido'
    }
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });
    res.json({
        test: situacao
    });

});

module.exports = router;