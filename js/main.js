'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu')
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('gloDelivery');

const cart = [];

const loadCart = function () {
    if (localStorage.getItem(login)) {
        JSON.parse(localStorage.getItem(login)).forEach(function (item) {
            cart.push(item);
        })
    }
}

const saveCart = function () {
    localStorage.setItem(login, JSON.stringify(cart))
}


const getData = async function (url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Ошибка по адресу ${ulr}, статус ошибки ${response.status}!`);
    }
    return await response.json();
};
const valid = function (str) {
    const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/
    return nameReg.test(str);
}

function toggleModal() {
    modal.classList.toggle("is-open");
}

function toggleModalAuth() {
    modalAuth.classList.toggle('is-open');
}

function authorized() {

    function logOut() {
        login = null;
        cart.length = 0;
        localStorage.removeItem('gloDelivery');
        buttonAuth.style.display = '';
        userName.style.display = '';
        buttonOut.style.display = '';
        cartButton.style.display = '';
        buttonOut.removeEventListener('click', logOut);
        containerPromo.classList.remove('hide');
        restaurants.classList.remove('hide');
        menu.classList.add('hide');
        checkAuth()
    }

    console.log('Авторизован');

    userName.textContent = login;

    buttonAuth.style.display = 'none';
    userName.style.display = 'inline';
    buttonOut.style.display = 'flex';
    cartButton.style.display = 'flex'

    buttonOut.addEventListener('click', logOut);

    loadCart();
}

function notAuthorized() {
    console.log('Не авторизован');

    function logIn(event) {
        event.preventDefault();
        if (valid(loginInput.value)) {
            login = loginInput.value;

            localStorage.setItem('gloDelivery', login);

            toggleModalAuth();
            buttonAuth.removeEventListener('click', toggleModalAuth);
            closeAuth.removeEventListener('click', toggleModalAuth);
            logInForm.removeEventListener('submit', logIn);
            logInForm.reset();

            checkAuth();
        } else {
            alert('Введите корректный логин');
        }
    }

    buttonAuth.addEventListener('click', toggleModalAuth);
    closeAuth.addEventListener('click', toggleModalAuth);
    logInForm.addEventListener('submit', logIn);
}

function checkAuth() {
    if (login) {
        authorized()
    } else {
        notAuthorized()
    }
}

function createCardRestaurant({image, kitchen, name, price, products, stars, time_of_delivery: timeOfDelivery}) {

    const card = `
        <a class="card card-restaurant" data-products="${products}">
            <img src="${image}" alt="image" class="card-image"/>
            <div class="card-text">
                <div class="card-heading">
                    <h3 class="card-title">${name}</h3>
                    <span class="card-tag tag">${timeOfDelivery} мин</span>
                </div>
                <div class="card-info">
                    <div class="rating">${stars}</div>
                    <div class="price">От ${price} ₽</div>
                    <div class="category">${kitchen}</div>
                </div>
            </div>
        </a>
    `;
    cardsRestaurants.insertAdjacentHTML('beforeend', card);
}

function createCardGood({description, id, image, name, price}) {

    const card = document.createElement('div')
    card.className = 'card';
    card.insertAdjacentHTML('beforeend', `
            <img src="${image}" alt="image" class="card-image"/>
            <div class="card-text">
                <div class="card-heading">
                    <h3 class="card-title card-title-reg">${name}</h3>
                </div>
                <div class="card-info">
                    <div class="ingredients">${description}</div>
                </div>
   
                <div class="card-buttons">
                    <button class="button button-primary button-add-cart" id="${id}">
                        <span class="button-card-text">В корзину</span>
                        <span class="button-cart-svg"></span>
                    </button>
                    <strong class="card-price-bold card-price">${price} ₽</strong>
                </div>
            </div>
    `);

    cardsMenu.insertAdjacentElement('beforeend', card);
}

function openGoods(event) {
    if (!login) {
        toggleModalAuth()
    } else {
        const target = event.target;
        const restaurant = target.closest('.card-restaurant');

        if (restaurant) {

            const name = restaurant.querySelector('.card-title').textContent;
            const rating = restaurant.querySelector('.rating').textContent;
            const minPrice = restaurant.querySelector('.price').textContent;
            const category = restaurant.querySelector('.category').textContent;

            menu.querySelector('.restaurant-title').textContent = name;
            menu.querySelector('.rating').textContent = rating;
            menu.querySelector('.price').textContent = minPrice;
            menu.querySelector('.category').textContent = category;

            cardsMenu.textContent = '';
            containerPromo.classList.add('hide');
            restaurants.classList.add('hide');
            menu.classList.remove('hide');

            getData(`./db/${restaurant.dataset.products}`).then(function (data) {
                data.forEach(createCardGood)
            });
        }
    }
}

function addToCart(event) {
    const target = event.target;
    const buttonAddToCart = target.closest('.button-add-cart');

    if (buttonAddToCart) {
        const card = target.closest('.card');
        const title = card.querySelector('.card-title-reg').textContent;
        const cost = card.querySelector('.card-price').textContent;
        const id = buttonAddToCart.id;

        const food = cart.find(function (item) {
            return item.id === id;
        })

        if (food) {
            food.count += 1;
        } else {
            cart.push({
                id,
                title,
                cost,
                count: 1,
            });
        }
        console.log(cart);
    }
    saveCart();
}

function renderCart() {
    modalBody.textContent = '';

    cart.forEach(function ({id, title, cost, count}) {
        const itemCart = `
            <div class="food-row">
                <span class="food-name">${title}</span>
                <strong class="food-price">${cost}</strong>
                <div class="food-counter">
                    <button class="counter-button counter-minus" data-id="${id}">-</button>
                    <span class="counter">${count}</span>
                    <button class="counter-button counter-plus" data-id="${id}">+</button>
                </div>
            </div>
        `;
        modalBody.insertAdjacentHTML('afterbegin', itemCart);
    });

    const totalPrice = cart.reduce(function (result, item) {
        console.log(item.cost);
        return result + (parseFloat(item.cost) * item.count);
    }, 0);

    modalPrice.textContent = totalPrice + ' ₽';

}

function changeCount(event) {
    const target = event.target;

    console.log(target.classList.contains('.counter-button'));
    //первый способ
    if (target.classList.contains('counter-button')) {
        const food = cart.find(function (item) {
            return item.id === target.dataset.id
        });
        if (target.classList.contains('counter-minus')) {
            food.count--;
            if (food.count === 0) {
                cart.splice(cart.indexOf(food), 1)
            }
        }
        if (target.classList.contains('counter-plus')) food.count++;

        renderCart();
    }
    saveCart()

    //второй способ

    /*if (target.classList.contains('counter-minus')) {
        const food = cart.find(function (item) {
            return item.id === target.dataset.id
        })
        food.count--;
        renderCart();
    }
    if (target.classList.contains('counter-plus')) {
        const food = cart.find(function (item) {
            return item.id === target.dataset.id
        })
        food.count++;
        renderCart()
    }
    saveCart();
*/
}

function init() {

    getData('./db/partners.json').then(function (data) {
        data.forEach(createCardRestaurant);
    });

    modalBody.addEventListener('click', changeCount);

    buttonClearCart.addEventListener('click', function () {
        cart.length = 0;
        renderCart();
    })

    cartButton.addEventListener("click", function () {
        renderCart();
        toggleModal();
    });

    cardsMenu.addEventListener('click', addToCart)

    close.addEventListener("click", toggleModal);

    cardsRestaurants.addEventListener('click', openGoods);

    logo.addEventListener('click', function () {
        containerPromo.classList.remove('hide');
        restaurants.classList.remove('hide');
        menu.classList.add('hide');
    });

    inputSearch.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            const target = event.target;
            const value = target.value.toLowerCase().trim();
            console.log(value);
            target.value = '';
            if (!value) {
                target.style.backgroundColor = 'red';
                setTimeout(function () {
                    target.style.backgroundColor = '';
                }, 3000);
                return
            }
            const goods = [];

            getData('./db/partners.json')
                .then(function (data) {
                    const products = data.map(function (item) {
                        return item.products;
                    });
                    products.forEach(function (product) {
                        getData(`./db/${product}`).then(function (data) {
                            goods.push(...data);

                            const searchGoods = goods.filter(function (item) {
                                return item.name.toLowerCase().includes(value)
                            })

                            console.log(searchGoods);

                            menu.querySelector('.restaurant-title').textContent = 'Search result';
                            menu.querySelector('.rating').textContent = '';
                            menu.querySelector('.price').textContent = '';
                            menu.querySelector('.category').textContent = '';

                            cardsMenu.textContent = '';
                            containerPromo.classList.add('hide');
                            restaurants.classList.add('hide');
                            menu.classList.remove('hide');

                            return searchGoods;
                        }).then(function (data) {
                            data.forEach(createCardGood);
                        })
                    })
                });
        }
    })

    checkAuth();

    new Swiper('.swiper-container', {
        autoplay: {
            delay: 2000,
            waitForTransition: true,
        },
        loop: true,
        spaceBetween: 30,
        effect: 'fade',
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}

init();
