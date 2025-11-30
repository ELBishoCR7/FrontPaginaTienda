alert("¡El archivo JS está conectado!");


document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const productList = document.getElementById('product-list');
    const logoutButton = document.getElementById('logoutButton');
    
    // Elementos del Carrito
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');

    let allProducts = []; // Aquí guardaremos los productos que traiga la API
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || []; // Cargar del storage o iniciar vacío

    // Token check
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Formateador de dinero
    const formatter = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    });

    // --- 1. CARGAR PRODUCTOS ---
    fetch('http://127.0.0.1:8000/products/', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if(res.status === 401) {
            alert("Sesión expirada");
            localStorage.clear();
            window.location.href = 'login.html';
        }
        return res.json();
    })
    .then(data => {
        // Guardamos los productos en la variable global para usarlos luego
        allProducts = Array.isArray(data) ? data : data.results;
        renderProducts(allProducts);
        updateCartUI(); // Actualizar el numerito del carrito al cargar
    })
    .catch(err => console.error("Error cargando productos:", err));

    // --- 2. RENDERIZAR PRODUCTOS ---
    function renderProducts(products) {
        if (!products || products.length === 0) {
            productList.innerHTML = '<p>No hay productos.</p>';
            return;
        }
        productList.innerHTML = '';
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            
            // NOTA: En el botón onclick pasamos solo el ID
            card.innerHTML = `
                <div class="image-container">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" class="product-image">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${formatter.format(product.price)}</p>
                    <button class="btn-add" onclick="addToCart(${product.id})">Agregar al Carrito</button>
                </div>
            `;
            productList.appendChild(card);
        });
    }

    // --- 3. LÓGICA DEL CARRITO (Global) ---
    
    // Función para agregar (debe ser accesible desde el HTML)
    window.addToCart = (id) => {
        // Buscamos el producto completo en nuestra lista guardada
        const product = allProducts.find(p => p.id === id);
        
        if (!product) return;

        // Revisar si ya está en el carrito
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1
            });
        }

        saveCart();
        updateCartUI();
        // Opcional: Abrir el carrito automáticamente al agregar
        cartModal.style.display = 'block';
    };

    // Función para eliminar o restar
    window.changeQuantity = (id, change) => {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Eliminar si llega a 0
            }
        }
        saveCart();
        updateCartUI();
    };

    // Guardar en LocalStorage
    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    // Actualizar la vista del carrito (HTML)
    function updateCartUI() {
        // 1. Actualizar contador del header
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalCount;

        // 2. Calcular total dinero
        const totalMoney = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = formatter.format(totalMoney);

        // 3. Dibujar items dentro del modal
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío.</p>';
            return;
        }

        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${formatter.format(item.price)} x ${item.quantity}</p>
                </div>
                <div class="item-controls">
                    <button onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    // --- 4. EVENTOS DEL MODAL ---
    
    // Abrir modal
    cartBtn.addEventListener('click', () => {
        cartModal.style.display = 'block';
        updateCartUI(); // Asegurarse que esté fresco
    });

    // Cerrar modal (X)
    closeCartBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Cerrar modal si clic afuera
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Logout
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        window.location.href = 'login.html';
    });
});