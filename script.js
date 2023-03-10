fetch("./productos.json")
  .then(resp => resp.json())
  .then(productosDB => miPrograma(productosDB))
  .catch(error => console.log(error))

function miPrograma(productos) {
  let carrito = localStorage.getItem("carrito") ? JSON.parse(localStorage.getItem("carrito")) : []


  let contenedorProductos = document.getElementById("contenedorProductos")
  let contenedorCarrito = document.getElementById("contenedorCarrito")
  let buscador = document.getElementById("buscador")
  let buscar = document.getElementById("buscar")
  buscar.onclick = filtrar




  let verCarrito = document.getElementById("verCarrito")
  verCarrito.addEventListener("click", mostrarOcultarCarrito)
  let contactoForm = document.getElementById("contactoBtn")
  contactoForm.addEventListener("click",mostrarOcultarContacto)

  function mostrarOcultarContacto(){
    contenedorProductos.classList.toggle("ocultar")
    let contactoOcultar = document.getElementById("ocultarContacto")
    contactoOcultar.classList.toggle("ocultar")

  }


  function mostrarOcultarCarrito() {
    contenedorProductos.classList.toggle("ocultar")
    contenedorCarrito.classList.toggle("ocultar")
    ocultarCarrito.classList.toggle("ocultar")
    
    
    
  }

  renderizarProductos(productos)
  renderizarCarrito(carrito)



  function filtrar() {
    let productosFiltrados
    if (buscador.value) {
      productosFiltrados = productos.filter(producto => producto.nombre.toLowerCase().includes(buscador.value.toLowerCase()) || producto.categoria.toLowerCase().includes(buscador.value.toLowerCase()))
    }
    renderizarProductos(productosFiltrados)
  }







  function carritoVacio() {
    if (carrito.length === 0) {
      contenedorCarrito.innerHTML = `
    <h3>¡Aún no agregastes productos!</h3>`
    }
  }
  carritoVacio()

  function renderizarProductos(arrayDeProductos) {
    contenedorProductos.innerHTML = ""
    arrayDeProductos.forEach(({ id, nombre, precio, img: imagen, stock }) => {
      let tarjetaProducto = document.createElement("div")
      tarjetaProducto.classList.add("producto")
      tarjetaProducto.id = `tarjeta${id}`

      tarjetaProducto.innerHTML = `
    <div class="card border-danger mb-3" style="max-width: 20rem;">
      <h3>${nombre}</h3>
      <p>$${new Intl.NumberFormat('de-DE').format(precio)}</p>
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


  }

  function agregarAlCarrito(e) {

    let id = e.target.id.slice(7)
    let productoBuscado = productos.find(producto => producto.id == id)
    let productoEnCarrito = carrito.find(producto => producto.id == productoBuscado.id)



    toasti("Producto Agregado")

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
    productosEnCarrito.forEach(({ nombre, unidades, subtotal, id, img: imagen }) => {
      let tarjetaProducto = document.createElement("div")
      tarjetaProducto.classList.add("itemCarrito")
      tarjetaProducto.innerHTML += `
      <h3>${nombre}</h3>
      <img src=./img/${imagen} class="imgCarrito">
      <p> Precio:<br>$${new Intl.NumberFormat('de-DE').format(subtotal)}</p>
      <button id=restarCant${id} class="btn btn-outline-primary">-</button>
      <p class="cantidadCArrito">Cantidad: ${unidades}</p>
      <button id=aumentarCant${id} class="btn btn-outline-primary">+</button>
      <p>Subtotal: $${new Intl.NumberFormat('de-DE').format(unidades * subtotal)}</p>
      <button id=eliminar${id} class="btn btn-outline-danger"> Eliminar</button>
      
    `
      contenedorCarrito.appendChild(tarjetaProducto)
      let btnEliminar = document.getElementById("eliminar" + id)
      btnEliminar.onclick = eliminarDelCarrito

      let btnRestarCant = document.getElementById("restarCant" + id)
      btnRestarCant.addEventListener("click", restarCant)

      let btnAumentarCant = document.getElementById("aumentarCant" + id)
      btnAumentarCant.onclick = aumentarCant


    })
    let precioTotal = document.getElementById("precioTotal")
    precioTotal.innerText =new Intl.NumberFormat('de-DE').format( carrito.reduce((acumulador, producto) => acumulador + producto.unidades * producto.subtotal, 0))
    
    const comprar = document.getElementById("comprar")
    comprar.addEventListener("click", finalizarCompra)



  }

  function finalizarCompra() {
    localStorage.removeItem("carrito")
    carrito = []
    renderizarCarrito(carrito)

    mostrarSweetAlert('Gracias por su compra', 'Enviaremos la factura a tu mail', 'success', 5000, false, 'https://cdn.shopify.com/s/files/1/0579/4106/5934/t/5/assets/in_cart.png?v=101847289933823475031672733811', 200, 200)
  }

  function aumentarCant(e) {

    let prodId = e.target.id.substring(12)
    let item = carrito.find(producto => producto.id === Number(prodId))
    let indice = carrito.indexOf(item)
    carrito[indice].unidades++
    toasti("Cantidad Actualizada")

    renderizarCarrito(carrito)
    localStorage.setItem("carrito", JSON.stringify(carrito))

  }

  function restarCant(e) {

    let prodId = e.target.id.substring(10)
    let item = carrito.find(producto => producto.id === Number(prodId))
    let indice = carrito.indexOf(item)
    if (carrito[indice].unidades > 1) {
      carrito[indice].unidades--
      toasti("Cantidad Actualizada")
    } else if (carrito[indice].unidades === 1) {
      toasti("Elimine el Producto")

    }
    renderizarCarrito(carrito)
    localStorage.setItem("carrito", JSON.stringify(carrito))
  }


  function eliminarDelCarrito(e) {
    let prodId = e.target.id.substring(9)
    let item = carrito.find((productos) => productos.id === parseInt(prodId))
    let indice = carrito.indexOf(item)
    carrito.splice(indice, 1)
    localStorage.removeItem("carrito", JSON.stringify(carrito))
    toasti("Producto Eliminado")
    renderizarCarrito(carrito)


  }

 

  






  function toasti(texto) {
    Toastify({
      text: texto,
      duration: 1500,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right,#00b09b, #96c93d )",
      }
    }).showToast();
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

  let btnEnviarForm = document.getElementById("enviarForm")
  btnEnviarForm.addEventListener("click", () => {
    let nombre = document.getElementById("nombre").value
    let apellido = document.getElementById("apellido").value
    let telefono = document.getElementById("telefono").value
    let email = document.getElementById("mail").value
    let mensaje = document.getElementById("msj").value


    if (nombre == "" || apellido == "" || telefono == "" || email == "" || mensaje == "") {
      mostrarSweetAlert('Error', 'Todos los campos deben completarse', 'error', 3000, 'Aceptar')
    } else {
      mostrarSweetAlert('Recibido', 'A la brevedad alguien de nuestro equipo se pondrá en contacto contigo', 'success', 3000, 'Aceptar')
    }
  })

}
