fetch("./productos.json")
.then(resp => resp.json())
.then(productosDB => miPrograma(productosDB))
.catch(error => console.log(error))


function miPrograma(productos){
let carrito = localStorage.getItem("carrito") ? JSON.parse(localStorage.getItem("carrito")) : []


let contenedorProductos = document.getElementById("contenedorProductos")
let contenedorCarrito = document.getElementById("contenedorCarrito")
let buscador = document.getElementById("buscador")
let buscar = document.getElementById("buscar")
buscar.onclick = filtrar

let inputMin = document.getElementById("min")
let inputMax = document.getElementById("max")

let verCarrito = document.getElementById("verCarrito")
verCarrito.addEventListener("click", mostrarOcultarCarrito)

function mostrarOcultarCarrito() {
  contenedorProductos.classList.toggle("ocultar")
  contenedorCarrito.classList.toggle("ocultar")
}

renderizarProductos(productos)
renderizarCarrito(carrito)

function finalizarCompra() {
  localStorage.removeItem("carrito")
  carrito = []
  renderizarCarrito(carrito)

  mostrarSweetAlert('Gracias por su compra','Enviaremos la factura a tu mail','success', 5000, false,'https://cdn.shopify.com/s/files/1/0579/4106/5934/t/5/assets/in_cart.png?v=101847289933823475031672733811',200,200)
}

function filtrar() {
  let productosFiltrados
  if (buscador.value) {
    productosFiltrados = productos.filter(producto => producto.nombre.toLowerCase().includes(buscador.value.toLowerCase()) || producto.categoria.toLowerCase().includes(buscador.value.toLowerCase()))
  } else if (inputMin.value && inputMax.value) {
    productosFiltrados = productos.filter(producto => producto.precio > Number(inputMin.value) && producto.precio < Number(inputMax.value))
  }
  renderizarProductos(productosFiltrados)
}

function renderizarProductos(arrayDeProductos) {
  contenedorProductos.innerHTML = ""
  arrayDeProductos.forEach(({ id, nombre, precio, img: imagen, stock }) => {
    let tarjetaProducto = document.createElement("div")
    tarjetaProducto.classList.add("producto")
    tarjetaProducto.id = `tarjeta${id}`

    tarjetaProducto.innerHTML = `
    <div class="card border-danger mb-3" style="max-width: 20rem;">
      <h3>${nombre}</h3>
      <p>$${precio}</p>
      <img src=./img/${imagen} class="imagen"/>
      <button id=agregar${id} class="btn btn-outline-success loQuiero">Agregar al carrito</button>
    </div>
    `
    if (stock < 10) {
      tarjetaProducto.classList.add("pocoStock")
      let pocasUnidades = document.createElement('p')
      pocasUnidades.classList.add('text-danger')
      pocasUnidades.innerText = "Quedan pocas unidades"
      tarjetaProducto.appendChild(pocasUnidades)
    }

    contenedorProductos.append(tarjetaProducto)

    let boton = document.getElementById("agregar" + id)
    boton.onclick = agregarAlCarrito
  })
  let categoria= getElementById("catComp")
  categoria.onclick(filtrarPorCategoria)
}

function agregarAlCarrito(e) {

  console.log(e)
  let id = e.target.id.slice(7)
  console.log(id)
  let productoBuscado = productos.find(producto => producto.id == id)
  let productoEnCarrito = carrito.find(producto => producto.id == productoBuscado.id)

 

  Toastify({
    text: "Producto agregado",
    duration: 3000,
    gravity: "top", 
    position: "right", 
    style:{
      background: "linear-gradient(to right,#00b09b, #96c93d )"
    }
  }).showToast();

  if (productoEnCarrito) {
    let posicionProducto = carrito.findIndex(producto => producto == productoEnCarrito)
    carrito[posicionProducto].unidades++
    carrito[posicionProducto].subtotal = carrito[posicionProducto].precio * carrito[posicionProducto].unidades
  } else {
    
    productoBuscado.unidades = 1
    productoBuscado.subtotal = productoBuscado.precio
    carrito.push(productoBuscado)
  }

  // Storage y JSON
  localStorage.setItem("carrito", JSON.stringify(carrito))

  renderizarCarrito(carrito)
}

function renderizarCarrito(productosEnCarrito) {
  contenedorCarrito.innerText = ""
  productosEnCarrito.forEach(({ nombre, unidades, subtotal, id }) => {
    let tarjetaProducto = document.createElement("div")
    tarjetaProducto.classList.add("itemCarrito")
    tarjetaProducto.innerHTML += `
      <h4>${nombre}</h3>
      <button id=dec${id} onclick= decrementarUnidad(${id}) class="btn btn-outline-primary">-</button>
      <p>${unidades}</p>
      <button id=inc${id} onclick= incrementarUnidad(${id}) class="btn btn-outline-primary">+</button>
      <p>Subtotal:${subtotal}</p>
      
    `
    contenedorCarrito.appendChild(tarjetaProducto)

  })

  contenedorCarrito.innerHTML += `
    <button id="comprar"class="btn btn-outline-success">COMPRAR</button>
  `
  let comprar = document.getElementById("comprar")
  comprar.addEventListener("click", finalizarCompra)
  
}

function decrementarUnidad(id) {

  let posProductoBuscado = carrito.findIndex(producto => producto.id == id)
  if (carrito[posProductoBuscado].unidades > 1) {
    carrito[posProductoBuscado].unidades--
    carrito[posProductoBuscado].subtotal = carrito[posProductoBuscado].precio * carrito[posProductoBuscado].unidades
  } else {
    carrito.splice(posProductoBuscado, 1)
    
  }
  renderizarCarrito(carrito)
}

function incrementarUnidad(id) {

  let posProductoBuscado = carrito.findIndex(producto => producto.id == id)
  let productoOriginal = productos.find(producto => producto.id == id)
  if (carrito[posProductoBuscado].unidades < productoOriginal.stock) {
    carrito[posProductoBuscado].unidades++
    carrito[posProductoBuscado].subtotal = carrito[posProductoBuscado].precio * carrito[posProductoBuscado].unidades
  } else {
    alert("no hay más unidades disponibles")
  }
  renderizarCarrito(carrito)
}

let categoria= getElementById("catComp")
categoria.onclick(filtrarPorCategoria)

function filtrarPorCategoria(e) {
  let productosFiltrados = productos.filter(({ categoria }) => categoria === e.target.id)
  renderizarProductos(productosFiltrados)
}

function mostrarSweetAlert(titulo, texto, icono, tiempo, mostrarBoton, urlImagen, anchoImagen, altoImagen) {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    timer: tiempo,
    showConfirmButton: mostrarBoton,
    imageUrl: urlImagen,
    imageWidth: anchoImagen,
    imageHeight: altoImagen
  })
}

  
}