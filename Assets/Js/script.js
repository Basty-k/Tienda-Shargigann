document.addEventListener('DOMContentLoaded', function() {
    const marvelPublicKey = 'cb3ee11af722339db02e0b63a8c99895';
    const marvelPrivateKey = 'c8b61562f8c1b23e90de7a34870911a21d2fdcb9';
    const marvelApiBaseUrl = 'https://gateway.marvel.com/v1/public';
    const comicPrice = 5000;
    const comicMaxQuantity = 5;




    function generateMarvelHash(ts) {
        return CryptoJS.MD5(ts + marvelPrivateKey + marvelPublicKey).toString();
    }
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetSection = document.querySelector(this.getAttribute('href'));
            document.querySelectorAll('main section').forEach(section => {
                section.classList.remove('active');
            });
            targetSection.classList.add('active');
        });
    });




    function mostrarComicsTienda(comics) {
        const productos = document.getElementById('productos');
        productos.innerHTML = '';




        comics.forEach(comic => {
            const comicDiv = document.createElement('div');
            const img = document.createElement('img');
            const title = document.createElement('h3');
            const quantity = document.createElement('p');
            const price = document.createElement('p');
            const buyButton = document.createElement('button');




            img.src = comic.thumbnail.path + '/portrait_incredible.' + comic.thumbnail.extension;
            title.textContent = comic.title;
            quantity.textContent = `Cantidad: ${comic.quantity}`;
            price.textContent = `Precio: $${comic.price}`;
            buyButton.textContent = 'Comprar';




            buyButton.addEventListener('click', () => {
                if (comic.quantity > 0) {
                    addToCart(comic);
                    comic.quantity--;
                    quantity.textContent = `Cantidad: ${comic.quantity}`;
                } else {
                    alert('Cantidad no disponible');
                }
            });




            comicDiv.appendChild(img);
            comicDiv.appendChild(title);
            comicDiv.appendChild(quantity);
            comicDiv.appendChild(price);
            comicDiv.appendChild(buyButton);
            productos.appendChild(comicDiv);
        });
    }




    async function fetchMarvelComics(limit = 50) {
        const ts = new Date().getTime();
        const hash = generateMarvelHash(ts);
        const response = await fetch(`${marvelApiBaseUrl}/comics?limit=${limit}&ts=${ts}&apikey=${marvelPublicKey}&hash=${hash}`);
        const data = await response.json();
        return data.data.results.map(comic => ({
            id: comic.id,
            title: comic.title,
            description: comic.description,
            thumbnail: comic.thumbnail,
            quantity: comicMaxQuantity,
            price: comicPrice
        }));
    }




    async function mostrarComicsInicioEspecificos() {
        const comics = await fetchMarvelComics();
        const comicsInicio = comics.filter(comic =>
            comic.title.includes('Iron Man') ||
            comic.title.includes('Spider-Man') ||
            comic.title.includes('Captain America')
        ).slice(0, 3);
        mostrarComicsInicio(comicsInicio);
    }




    async function mostrarComicsTiendaTodos() {
        const comics = await fetchMarvelComics();
        mostrarComicsTienda(comics);
    }




    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');




    function addToCart(comic) {
        const existingItem = carrito.find(item => item.id === comic.id);
        if (existingItem) {
            if (existingItem.quantity < comicMaxQuantity) {
                existingItem.quantity++;
            } else {
                alert('Cantidad máxima alcanzada');
                return;
            }
        } else {
            carrito.push({ ...comic, quantity: 1 });
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarrito();
    }




    function actualizarCarrito() {
        listaCarrito.innerHTML = '';
        let total = 0;
        carrito.forEach(item => {
            const itemCarrito = document.createElement('div');
            itemCarrito.classList.add('item-carrito');




            const img = document.createElement('img');
            img.src = item.thumbnail.path + '/portrait_incredible.' + item.thumbnail.extension;




            const info = document.createElement('div');
            info.classList.add('comic-info');
            info.innerHTML = `<h4>${item.title}</h4><p>Precio: $${item.price}</p><p>Cantidad: ${item.quantity}</p>`;




            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Eliminar';
            removeBtn.addEventListener('click', function() {
                const index = carrito.indexOf(item);
                carrito.splice(index, 1);
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarCarrito();
            });




            itemCarrito.appendChild(img);
            itemCarrito.appendChild(info);
            itemCarrito.appendChild(removeBtn);




            listaCarrito.appendChild(itemCarrito);
            total += item.price * item.quantity;
        });




        totalCarrito.textContent = `Total: $${total.toFixed(2)}`;
    }




    vaciarCarritoBtn.addEventListener('click', function() {
        carrito.length = 0;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarrito();
    });




    mostrarComicsInicioEspecificos();
    mostrarComicsTiendaTodos();
    actualizarCarrito();




    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const mensajeSesion = document.getElementById('mensaje-sesion');
    const usuarioBienvenida = document.getElementById('usuario-bienvenida');




    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;




        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);




        if (user) {
            mensajeSesion.textContent = 'Sesión iniciada correctamente';
            mensajeSesion.style.color = 'green';
            localStorage.setItem('usuarioActivo', JSON.stringify(user));
            usuarioBienvenida.textContent = `Bienvenido, ${user.username}`;
        } else {
            mensajeSesion.textContent = 'Usuario o contraseña incorrectos';
            mensajeSesion.style.color = 'red';
        }
    });




    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('register-gmail').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;




        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(u => u.username === username);




        if (!userExists) {
            users.push({ email, username, password });
            localStorage.setItem('users', JSON.stringify(users));
            mensajeSesion.textContent = 'Registro exitoso, por favor inicia sesión';
            mensajeSesion.style.color = 'green';
        } else {
            mensajeSesion.textContent = 'Nombre de usuario ya existe';
            mensajeSesion.style.color = 'red';
        }
    });




    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (usuarioActivo) {
        usuarioBienvenida.textContent = `Bienvenido, ${usuarioActivo.username}`;
    }




    // Modal de Tarjeta de Crédito
    const comprarBtn = document.getElementById('comprar');
    const modal = document.getElementById('modal-tarjeta');
    const span = document.getElementsByClassName('close')[0];
    const formTarjeta = document.getElementById('form-tarjeta');




    comprarBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });




    span.addEventListener('click', function() {
        modal.style.display = 'none';
    });




    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });




    formTarjeta.addEventListener('submit', function(event) {
        event.preventDefault();
        const nombreTarjeta = document.getElementById('nombre-tarjeta').value;
        const numeroTarjeta = document.getElementById('numero-tarjeta').value;
        const fechaExpiracion = document.getElementById('fecha-expiracion').value;
        const cvv = document.getElementById('cvv').value;




        // Aquí podrías enviar los datos de la tarjeta a una pasarela de pagos




        alert('Datos de tarjeta recibidos. Compra realizada exitosamente.');




        // Vaciar carrito después de la compra
        carrito.length = 0;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarrito();




        // Cerrar modal
        modal.style.display = 'none';
    });
});
