document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    cordova.plugin.http.setDataSerializer('json');
    exibirPizzas();
}

const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const btnFoto = document.getElementById("btnFoto");
const btnNovo = document.getElementById("btnNovo");
const pizzaInput = document.getElementById("pizza");
const precoInput = document.getElementById("preco");
const imagemDiv = document.getElementById("imagem");
const applista = document.getElementById("applista");
const appcadastro = document.getElementById("appcadastro");

const PIZZARIA_ID = "pizzaria_do_fe";
let pizzas = [];
let pizzaSelecionada = null;
let pizzaEditandoId = null; 


function salvarPizza() {
    const pizzaNome = pizzaInput.value.trim();
    const preco = precoInput.value.trim();
    const imagem = imagemDiv.style.backgroundImage;

    if (!pizzaNome || !preco || !imagem || imagem === 'none') {
        alert("Todos os campos devem ser preenchidos corretamente!");
        return;
    }

    const data = {
        pizzaria: PIZZARIA_ID,
        pizza: pizzaNome,
        preco: preco,
        imagem: imagem
    };

    if (pizzaEditandoId) {  
        data.pizzaid = pizzaEditandoId; 

        cordova.plugin.http.put(
            'https://pedidos-pizzaria.glitch.me/admin/pizza/',
            data,
            {},
            function(response) {
                alert("Pizza atualizada com sucesso!");
                pizzaEditandoId = null;
                exibirPizzas();
                cancelarCadastro();
            },
            function(error) {
                alert("Erro ao atualizar a pizza: " + error.error);
            }
        );
    } else {
        cordova.plugin.http.post(
            'https://pedidos-pizzaria.glitch.me/admin/pizza/',
            data,
            {},
            function(response) {
                alert("Pizza cadastrada com sucesso!");
                exibirPizzas();
                cancelarCadastro();
            },
            function(error) {
                alert("Erro ao cadastrar a pizza: " + error.error);
            }
        );
    }
}

function exibirPizzas() {
    const listaPizzas = document.getElementById("listaPizzas");
    listaPizzas.innerHTML = '';
    pizzaSelecionada = null;

    cordova.plugin.http.get(
        `https://pedidos-pizzaria.glitch.me/admin/pizzas/${PIZZARIA_ID}`,
        {},
        {},
        function(response) {
            pizzas = JSON.parse(response.data);
            pizzas.forEach((pizza, idx) => {
                const divPizza = document.createElement("div");
                divPizza.classList.add("linha");
                divPizza.innerHTML = `<strong>${pizza.pizza}</strong><br>Preço: ${pizza.preco}`;
                divPizza.onclick = function () {
                    carregarDadosPizza(idx);
                };
                listaPizzas.appendChild(divPizza);
            });
        },
        function(error) {
            alert("Erro ao carregar as pizzas: " + error.error);
        }
    );
}

function carregarDadosPizza(id) {
    const pizzaSelecionada = pizzas[id];  

    pizzaEditandoId = pizzaSelecionada._id;  

    pizzaInput.value = pizzaSelecionada.pizza;
    precoInput.value = pizzaSelecionada.preco;
    imagemDiv.style.backgroundImage = pizzaSelecionada.imagem;

    applista.style.display = 'none';
    appcadastro.style.display = 'flex';
}

function cancelarCadastro() {
    pizzaInput.value = '';
    precoInput.value = '';
    imagemDiv.style.backgroundImage = '';
    pizzaEditandoId = null;

    applista.style.display = 'flex'; 
    appcadastro.style.display = 'none'; 
}

function excluirPizza() {
    if (!pizzaSelecionada) {
        alert("Nenhuma pizza selecionada para excluir!");
        return;
    }
    
    const url = `https://pedidos-pizzaria.glitch.me/admin/pizza/${PIZZARIA_ID}/${pizzaSelecionada.pizza}`;
    cordova.plugin.http.delete(
        url,
        {},
        {},
        function(response) {
            alert("Pizza excluída com sucesso!");
            exibirPizzas();
            cancelarCadastro();
        },
        function(error) {
            alert("Erro ao excluir a pizza: " + error.error);
        }
    );
}

btnFoto.addEventListener('click', function() {
    navigator.camera.getPicture(
        function(imageData) {
            imagemDiv.style.backgroundImage = `url(data:image/jpeg;base64,${imageData})`;
        },
        function(error) {
            alert("Erro ao capturar a foto: " + error);
        },
        {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            correctOrientation: true
        }
    );
});

btnNovo.addEventListener('click', function() {
    pizzaSelecionada = null;
    pizzaInput.value = '';
    precoInput.value = '';
    imagemDiv.style.backgroundImage = '';
    applista.style.display = 'none';
    appcadastro.style.display = 'flex';
});

btnSalvar.addEventListener('click', salvarPizza);
btnCancelar.addEventListener('click', cancelarCadastro);
document.getElementById("btnExcluir").addEventListener('click', excluirPizza);