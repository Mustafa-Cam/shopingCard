const cartbtn =document.querySelector(".cart-btn")
const clearcartbtn =document.querySelector(".btn-clear")
const cartItems =document.querySelector(".cart-items")
const cartTotal =document.querySelector(".total-value")
const cartContent =document.querySelector(".cart-list")
const productsDOM =document.querySelector("#products-dom")

let cart = [];
let buttonsdom = [];

// console.log(productsDOM)

class Products{
async getProducts(){
    try{
        let result = await fetch("https://63c80125e52516043f498077.mockapi.io/products")
        let data = await result.json();
        let products =data;
        console.log(products)
        return products ;
    }catch(error){
        console.log(error);
    }
}
}
class UI{

    displayProducts(products){
        let result="";
        products.forEach(element => {
            result += `
            <div class="col-lg-4 col-md-6">
            <div class="product">

                <div class="product-image">
                    <img src="${element.image}" alt="product">
                </div>
                <div class="product-hover">
                    <span class="product-title">${element.title}</span>
                    <span class="product-price">${element.price}</span>
                    <button class="btn-add-to-cart" data-id=${element.id}>
                        <i class="fas fa-cart-shopping"></i>
                    </button>
                </div>
            </div>
        </div>
            `});
            productsDOM.innerHTML=result;

    }

    getBagButtons(){
        const buttons = [...document.querySelectorAll(".btn-add-to-cart")]
        buttonsdom = buttons;
         buttons.forEach(button => {
            let id = button.dataset.id;
            let incart = cart.find(item => item.id === id)
            if(incart){
                button.setAttribute("disabled","disabled");
                button.style.opacity =".3"
            }else{
                button.addEventListener("click",event=>{
                    event.target.disabled = true;
                    event.target.style.opacity = ".3";
                   // products dan product ları al 
                    let cartItem = {...Storage.getProducts(id),amount: 1 }
                    //cart a product ları ekliyoruz
                    cart =[...cart,cartItem];
                    Storage.savecart(cart);
                     this.saveCartValues(cart);
                     this.addcartitem(cartItem);
                     this.showcart();
                })
            }
         })

    }
    saveCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item=>{
            tempTotal += item.price * item.amount; 
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal;
    }
    addcartitem(item){
        const li = document.createElement("li");
        li.classList.add("cart-list-item")
        li.innerHTML=`
        <div class="cart-left">
                            <div class="cart-left-image">
                                <img src="${item.image}" alt="">
                            </div>
                            <div class="cart-left-info">
                                <a href="#" class="cart-left-info-title">${item.title}</a>
                                <span class="cart-left-info-pirce">${item.price}</span>
                            </div>
                        </div>
                        <div class="cart-right">
                            <div class="cart-right-quantity">
                                <button class="quantity-minus" data-id=${item.id}>
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity">${item.amount}</span>
                                <button class="quantity-plus" data-id=${item.id}>
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="cart-right-remove" >
                                <button class="cart-remove-btn" data-id=${item.id}>
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
        `;
        cartContent.appendChild(li);

    }
    showcart(){
        cartbtn.click();
    }
    setupAPP(){
        cart = Storage.getcart()
        this.saveCartValues(cart);
        this.populatecart(cart);
    }
    populatecart(cart){
        cart.forEach(item => this.addcartitem(item));
    }
    cartlogic(){
        clearcartbtn.addEventListener("click",()=>{
            this.clearcart();
        })
        cartContent.addEventListener("click",event=>{
            if(event.target.classList.contains("cart-remove-btn")){
                let removeitem = event.target;
                console.log(removeitem)
                let id = removeitem.dataset.id;
                removeitem.parentElement.parentElement.parentElement.remove();
                this.removecart(id);
            }else if (event.target.classList.contains("quantity-minus")) {
                let loweramount = event.target;
                console.log(loweramount)
                let id = loweramount.dataset.id;
                let tempitem = cart.find(item=>item.id === id);
                tempitem.amount = tempitem.amount - 1; 
                if(tempitem.amount>0){
                    Storage.savecart(cart);
                    this.saveCartValues(cart);
                    loweramount.nextElementSibling.innerText = tempitem.amount;
                }
                else {
                    loweramount.parentElement.parentElement.parentElement.remove();
                    this.removecart(id);
                }}
                else if(event.target.classList.contains("quantity-plus")){
                    let addamount= event.target;
                    let id = addamount.dataset.id;
                    let tempitem = cart.find(item=>item.id===id);
                    tempitem.amount +=1;
                    Storage.savecart(cart);
                    this.saveCartValues(cart);
                    addamount.previousElementSibling.innerText=tempitem.amount;
                }
            
        })
    }
    clearcart(){
        let cartitems = cart.map(item=>item.id);
        cartitems.forEach(id=>this.removecart(id));
        while(cartContent.children.length >0){
            cartContent.removeChild(cartContent.children[0])
        }
    }
    removecart(id){
        cart = cart.filter(item=>item.id !==id);
        this.saveCartValues(cart);
        Storage.savecart(cart);
        let button =this.getSinleButton(id); 
        button.disabled = false;
        button.style.opacity="1";
    }
    getSinleButton(id){
        return buttonsdom.find(button=>button.dataset.id === id);
    }

}
class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProducts(id){
        let products = JSON.parse(localStorage.getItem("products"))
      return  products.find(product=>product.id===id);
    }
    static savecart(cart){
        localStorage.setItem("cart",JSON.stringify(cart))
    }
    static getcart(){
       return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")): [];
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const products = new Products();
    const ui = new UI;

    ui.setupAPP();
    products.getProducts().then(products=>{
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartlogic();
    })
})