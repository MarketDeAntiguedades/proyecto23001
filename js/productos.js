const { createApp } = Vue;

// Crea una instancia de la aplicación Vue
createApp({
  data() {
    /* El código define una instancia de la aplicación Vue. Aquí se especifican los datos utilizados por la aplicación, incluyendo la lista de productos, la URL del backend, indicadores de error y carga, así como los atributos para almacenar los valores del formulario de producto.
     */
    return {
      productos: [], // Almacena los productos obtenidos del backend
      // url:'http://localhost:5000/productos', // URL local
      url: "https://mahumada.pythonanywhere.com/productos", // URL del backend donde se encuentran los productos
      error: false,
      cargando: true,
      // Atributos para el almacenar los valores del formulario
      id: 0,
      nombre: "",
      imagen: "",
      stock: "",
      precio: "",
      respuesta: false,
      reg_count: 0,
      string_busqueda: "",
      bol_busqueda: false,
      bol_deleted: false,
      bol_created: false,
      bol_modal: false,
      mensaje: "",
    };
  },
  methods: {
    fetchData(url) {
      /**El método fetchData realiza una solicitud HTTP utilizando la función fetch a la URL especificada. Luego, los datos de respuesta se convierten en formato JSON y se asignan al arreglo productos. Además, se actualiza la variable cargando para indicar que la carga de productos ha finalizado. En caso de producirse un error, se muestra en la consola y se establece la variable error en true.
       *
       */
      fetch(url)
        .then((response) => response.json()) // Convierte la respuesta en formato JSON
        .then((data) => {
          // Asigna los datos de los productos obtenidos al arreglo 'productos'
          this.productos = data;
          this.cargando = false;
        })
        .catch((err) => {
          console.error(err);
          this.error = true;
        });
    },
    eliminar(producto) {
      /* El método eliminar toma un parámetro producto y construye la URL para eliminar ese producto en particular. Luego, realiza una solicitud fetch utilizando el método HTTP DELETE a la URL especificada. Después de eliminar el producto, la página se recarga para reflejar los cambios.
       */
      // Construye la URL para eliminar el producto especificado
      const url = this.url + "/" + producto;
      var options = {
        method: "DELETE", // Establece el método HTTP como DELETE
      };
      fetch(url, options)
        .then((res) => res.text()) // Convierte la respuesta en texto (or res.json())
        .then((res) => {
          bol_deleted=true;
          cargando = true;
          setTimeout(() => {
            location.reload(); // Recarga la página actual después de eliminar el producto
          }, 1000);

        });
    },
    grabar() {
      /* El método grabar se encarga de guardar los datos de un nuevo producto en el servidor. Primero, se crea un objeto producto con los datos ingresados en el formulario. Luego, se configuran las opciones para la solicitud fetch, incluyendo el cuerpo de la solicitud como una cadena JSON, el método HTTP como POST y el encabezado Content-Type como application/json. Después, se realiza la solicitud fetch a la URL especificada utilizando las opciones establecidas. Si la operación se realiza con éxito, se muestra un mensaje de éxito y se redirige al usuario a la página de productos. Si ocurre algún error, se muestra un mensaje de error.
       */
      // Crear un objeto 'producto' con los datos del formulario
      let producto = {
        nombre: this.nombre,
        precio: this.precio,
        stock: this.stock,
        imagen: this.imagen,
      };
//      console.log(this.error);
      if  (!this.nombre){
        this.error = true;
        this.mensaje="Debe completar el nombre";
      }else{
        if (!this.precio>0){
          this.error = true;
          this.mensaje="Debe informar un precio mayor a cero"
        }else{
          if (!this.stock>0){
            this.error = true;
            this.mensaje="Debe informar un stock mayor a cero"
          }else{
            this.error = false;
          }
        }
      }
/*      var forms = document.querySelectorAll('.needs-validation')
      console.log(forms);
      Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })*/
  
      // Configurar las opciones para la solicitud fetch
      var options = {
        body: JSON.stringify(producto), // Convertir el objeto a una cadena JSON
        method: "POST", // Establecer el método HTTP como POST
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        respuesta: JSON.response,
      };
      // Realizar una solicitud fetch para guardar el producto en el servidor
//      console.log(this.nombre);
      if (!this.error) {
        this.bol_created=true;
        this.mensaje="Registro grabado. Volviendo a PRODUCTOS..."
        fetch(this.url, options)
            .then(function () {
              setTimeout(() => {
                window.location.href = "./productos.html";
              }, 1000);
            })
            .catch((err) => {
              console.error(err);
              alert("Error al Grabar.");
            });
      }
    },
  },
  created() {
    this.fetchData(this.url);
    var elVue = this;
    document.getElementById("formularioBusqueda").addEventListener("submit", function (event) {
      // Evitar que el formulario se envíe de forma predeterminada
      event.preventDefault();
      elVue.bol_busqueda = false;

      // Obtener el valor del campo de búsqueda
      var textoBuscado = document.getElementsByName("textoBuscado")[0].value;
      if(textoBuscado!=""){
      
        elVue.cargando = true;
        elVue.string_busqueda = textoBuscado;
        console.log(textoBuscado);
        console.log(elVue.respuesta)
      
        // Realizar una solicitud fetch para enviar los datos del formulario a la ruta Flask
        fetch("https://mahumada.pythonanywhere.com/productos/find/" + textoBuscado )
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            const modal = document.querySelector(".modal");
            const openModalBtn = document.getElementById("alertbox");
            const err_mensaje = document.querySelector("#error")
            console.log(openModalBtn);
            // Mostrar los productos que coinciden con el término de búsqueda
            
            elVue.reg_count = Object.keys(data).length;
            if  (elVue.reg_count > 0){
              elVue.productos = data;
              elVue.cargando = false;
              elVue.tituloTabla = "Productos filtrados cuyo nombre contienen el texto " + textoBuscado;
              elVue.bol_busqueda = true;
            }else{
              elVue.cargando=false;
              elVue.bol_busqueda = true;
              elVue.bol_modal=true;
              modal.classList.remove("hidden")
              err_mensaje.innerText = "No se encontró información para la búsqueda '" + textoBuscado + "'."
              openModalBtn.click();
            }
          })
          .catch((err) => {
            console.error(err);
            elVue.error = true;
            alert("Error al buscar productos!");
          });
      } else {
        elVue.tituloTabla = "Productos"
        elVue.fetchData(elVue.url);
      }
    }
  )},

}).mount("#app");
