document.addEventListener("DOMContentLoaded", () => {

    /* ==================================================================
       PHẦN 1: LOGIC CHUNG CHO GIỎ HÀNG (Dùng cho mọi trang)
    ================================================================== */
    
    // 1. Hàm cập nhật số lượng trên Icon Giỏ hàng
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('greenlife_cart')) || [];
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Tìm element hiển thị số (có thể là #cart-count hoặc .cart-icon span)
        const cartText = document.querySelector('.cart-icon span') || document.getElementById('cart-count');
        if (cartText) {
            cartText.innerText = `Giỏ hàng (${totalCount})`;
        }
    }

    // 2. Hàm thêm sản phẩm vào LocalStorage
    function addToCartLogic(product) {
        let cart = JSON.parse(localStorage.getItem('greenlife_cart')) || [];
        
        const existingItem = cart.find(item => item.name === product.name);

        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            cart.push(product);
        }

        localStorage.setItem('greenlife_cart', JSON.stringify(cart));
        
        updateCartCount();
        alert(`Đã thêm ${product.quantity} "${product.name}" vào giỏ hàng thành công!`);
    }

    // Chạy cập nhật số lượng ngay khi tải trang
    updateCartCount();


    /* ==================================================================
       PHẦN 2: LOGIC TRANG GIỎ HÀNG (GIOHANG.HTML)
       - Body ID không bắt buộc, kiểm tra bảng #cart-body
    ================================================================== */
    const cartBody = document.getElementById('cart-body');
    
    if (cartBody) {
        // Hàm hiển thị (Render) giỏ hàng
        window.loadCart = function() {
            const cart = JSON.parse(localStorage.getItem('greenlife_cart')) || [];
            const totalEl = document.getElementById('total-price');
            
            cartBody.innerHTML = ''; 
            let grandTotal = 0;

            if (cart.length === 0) {
                cartBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: #777;">Giỏ hàng đang trống 🌿. <br><a href="sanpham.html" style="color:var(--primary)">Đi mua ngay</a></td></tr>';
                if(totalEl) totalEl.innerText = '0đ';
                return;
            }

            cart.forEach((item, index) => {
                const total = item.price * item.quantity;
                grandTotal += total;

                const priceFormatted = item.price.toLocaleString('vi-VN') + 'đ';
                const totalFormatted = total.toLocaleString('vi-VN') + 'đ';

                const row = `
                    <tr>
                        <td>
                            <div class="cart-item-info">
                                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                                <b style="color: var(--primary)">${item.name}</b>
                            </div>
                        </td>
                        <td>${priceFormatted}</td>
                        <td>
                            <div class="qty-box">
                                <button class="qty-btn" onclick="window.changeQty(${index}, -1)">-</button>
                                <div class="qty-val">${item.quantity}</div>
                                <button class="qty-btn" onclick="window.changeQty(${index}, 1)">+</button>
                            </div>
                        </td>
                        <td style="color: var(--accent); font-weight:bold;">${totalFormatted}</td>
                        <td>
                            <button class="btn-remove" onclick="window.removeItem(${index})">🗑️</button>
                        </td>
                    </tr>
                `;
                cartBody.innerHTML += row;
            });

            if(totalEl) totalEl.innerText = grandTotal.toLocaleString('vi-VN') + 'đ';
        };

        // Hàm thay đổi số lượng
        window.changeQty = function(index, delta) {
            let cart = JSON.parse(localStorage.getItem('greenlife_cart')) || [];
            cart[index].quantity += delta;

            if (cart[index].quantity < 1) {
                const confirmDelete = confirm("Xóa sản phẩm này khỏi giỏ hàng?");
                if (confirmDelete) {
                    cart.splice(index, 1);
                } else {
                    cart[index].quantity = 1;
                }
            }
            localStorage.setItem('greenlife_cart', JSON.stringify(cart));
            loadCart();
            updateCartCount(); 
        };

        // Hàm xóa sản phẩm
        window.removeItem = function(index) {
            if(confirm("Xóa sản phẩm này?")) {
                let cart = JSON.parse(localStorage.getItem('greenlife_cart')) || [];
                cart.splice(index, 1); 
                localStorage.setItem('greenlife_cart', JSON.stringify(cart)); 
                loadCart(); 
                updateCartCount();
            }
        };

        // Chạy lần đầu
        loadCart();
    }


    /* ==================================================================
       PHẦN 3: LOGIC TRANG CHỦ (INDEX.HTML) - Mua từ thẻ lật
    ================================================================== */
    const indexBuyBtns = document.querySelectorAll('.book-back .btn');

    if (indexBuyBtns.length > 0) {
        indexBuyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const originalText = btn.innerText;
                btn.innerText = "Đang thêm...";

                const card = e.target.closest('.book-inner');
                const img = card.querySelector('.book-front img').src;
                const name = card.querySelector('h3').innerText;
                const priceText = card.querySelector('.price').innerText;
                const price = parseInt(priceText.replace(/\D/g, ''));

                const product = { name: name, price: price, image: img, quantity: 1 };
                addToCartLogic(product);

                setTimeout(() => { btn.innerText = originalText; }, 500);
            });
        });
    }


    /* ==================================================================
       PHẦN 4: LOGIC TRANG SẢN PHẨM (SANPHAM.HTML) - Mua & Lọc
    ================================================================== */
    // Mua hàng
    const productBuyBtns = document.querySelectorAll('.product-card .btn-buy');
    if (productBuyBtns.length > 0) {
        productBuyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const originalText = btn.innerText;
                btn.innerText = "Đang thêm...";
                
                const card = e.target.closest('.product-card');
                const img = card.querySelector('.card-img img').src;
                const name = card.querySelector('.p-name').innerText;
                const priceText = card.querySelector('.p-price').innerText;
                const price = parseInt(priceText.replace(/\D/g, '')); 
                
                // Kiểm tra input số lượng, nếu không có thì mặc định là 1
                const qtyInput = card.querySelector('.qty-input');
                const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

                const product = { name: name, price: price, image: img, quantity: quantity };
                addToCartLogic(product);

                setTimeout(() => { btn.innerText = originalText; }, 500);
            });
        });
    }

    // Bộ lọc
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filterValue = button.getAttribute('data-filter');
                productCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.classList.remove('hide');
                    } else {
                        card.classList.add('hide');
                    }
                });
            });
        });
    }


    /* ==================================================================
       PHẦN 5: LOGIC ĐĂNG KÝ / ĐĂNG NHẬP (Code cũ của bạn)
    ================================================================== */
    
    // 1. Trang Đăng Ký
    if (document.getElementById("Dangky")) {
        const pw = document.getElementById("NMK");
        const btn = document.getElementById("eye-btn");
        const icon = document.getElementById("eye-icon");
        let open = true;

        if (btn) {
            btn.addEventListener("click", () => {
                if (open) {
                    pw.type = "text"; open = false;
                    icon.innerHTML = `<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="3" x2="21" y2="21" stroke="black" stroke-width="2"/>`;
                } else {
                    pw.type = "password"; open = true;
                    icon.innerHTML = `<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>`;
                }
            });
        }

        const registerBtn = document.getElementById("BDK");
        const emailInput = document.getElementById("NTK");
        const passwordInput = document.getElementById("NMK");
        const emailError = document.getElementById("erremail");
        const passwordError = document.getElementById("errMK");

        if (registerBtn) {
            registerBtn.addEventListener("click", () => {
                const email = emailInput.value.trim();
                const password = passwordInput.value.trim();
                let valid = true;

                emailError.style.display = "none"; emailError.textContent = "";
                passwordError.style.display = "none"; passwordError.textContent = "";

                const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/i;
                if (email === "") { emailError.textContent = "Vui lòng nhập email"; emailError.style.display = "block"; valid = false; }
                else if (!emailPattern.test(email)) { emailError.textContent = "Email không hợp lệ"; emailError.style.display = "block"; valid = false; }

                if (password === "") { passwordError.textContent = "Vui lòng nhập mật khẩu"; passwordError.style.display = "block"; valid = false; }
                else if (password.length < 8) { passwordError.textContent = "Mật khẩu quá ngắn (ít nhất 8 ký tự)"; passwordError.style.display = "block"; valid = false; }
                else {
                    const upperCase = /[A-Z]/.test(password); const lowerCase = /[a-z]/.test(password); const number = /[0-9]/.test(password); const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                    if (!upperCase || !lowerCase || !number || !specialChar) { passwordError.textContent = "Mật khẩu yếu. Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."; passwordError.style.display = "block"; valid = false; }
                }

                if (valid) {
                    alert(`Đăng ký thành công!`);
                    localStorage.setItem("emailUser", email);
                    localStorage.setItem("passUser", password);
                    window.location.href = "Dangnhap.html";
                }
            });
        }
    }

    // 2. Trang Đăng Nhập
    if (document.getElementById("Dangnhap")) {
        const pw = document.getElementById("NMK");
        const btn = document.getElementById("eye-btn");
        const icon = document.getElementById("eye-icon");
        let open = true;

        if (btn) {
            btn.addEventListener("click", () => {
                if (open) {
                    pw.type = "text"; open = false;
                    icon.innerHTML = `<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="3" x2="21" y2="21" stroke="black" stroke-width="2"/>`;
                } else {
                    pw.type = "password"; open = true;
                    icon.innerHTML = `<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>`;
                }
            });
        }

        const loginBtn = document.getElementById("BDN");
        const emailInput = document.getElementById("NTK");
        const passwordInput = document.getElementById("NMK");
        const passwordError = document.getElementById("errMK");

        if (loginBtn) {
            loginBtn.addEventListener("click", () => {
                const email = emailInput.value.trim();
                const password = passwordInput.value.trim();
                const storedEmail = localStorage.getItem("emailUser");
                const storedPass = localStorage.getItem("passUser");

                if (email === storedEmail && password === storedPass) {
                    window.location.href = "index.html"; 
                } else {
                    passwordError.textContent = "Sai email hoặc mật khẩu!";
                    passwordError.style.display = "block";
                }
            });
        }
    }

});