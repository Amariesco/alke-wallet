// Intrucciones:
// Captura los eventos de los formularios y botones mediante JavaScript.
// Valida los campos del formulario antes de enviar los datos.
// Actualiza dinámicamente la información en la pantalla del menú principal cuando se realizan depósitos, envíos de dinero, etc.

// Notas:
// *Se cambian todos los document.querySelector por $( de Jquery
// *Se agrega localStorage.removeItem en cerrar sesion, para que no guarde en local despues de cerrar la sesion. 
// *Se cambian los inputs para agregar contactos ya que [type="text"] en nombre y banco podria dar error.
// *Se cambia la <li> de transacciones a <div> para que no muestre puntos en la lista de movimientos.
// El cerrar sesion no esta limpiando Local.Storage (Pendiente de revisar!)

if (!localStorage.getItem('saldo')) {
    localStorage.setItem('saldo', '15750');
} // if para que solo se realice esto si no hay dato 'saldo' en el localStorage

if (!localStorage.getItem('movimientos')) {
    localStorage.setItem('movimientos', JSON.stringify([]));
}// if para que solo se realice esto si no hay dato 'movimiento' en el localStorage

// PARA LOGIN 
function validarLogin(event) {
    event.preventDefault(); // Evita que el formulario se envíe

    // Obtener valores de los campos
    var email = $('#emailInput').val(); // se reemplaza ( var email = document.querySelector('input[type="email"]').value; ) por jquery 
    var password = $('#passwordInput').val(); // se reemplaza ( var password = document.querySelector('input[type="password"]').value; ) por jquery 

    // Credenciales 'correctas' ((CAMBIAR cuando sea necesario!!))
    var emailCorrecto = 'ana@email.com';
    var passwordCorrecta = '1234';

    $('#alert-container').empty();  // Limpia alertas previas

    // Validar credenciales y alertas con bootstrap
    if (email === emailCorrecto && password === passwordCorrecta) {
        var alertaExito = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <strong>¡Éxito!</strong> Inicio de sesión correcto. Redirigiendo...
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        $('#alert-container').html(alertaExito);

        setTimeout(function () {
            window.location.href = 'menu.html';
        }, 1500);
    } else {
        var alertaError = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>¡Error!</strong> Email o contraseña incorrectos.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        $('#alert-container').html(alertaError);
    }
}

// PARA MENÚ

function mostrarSaldo() {
    var saldo = localStorage.getItem('saldo');
    var $elementoSaldo = $('.saldo h2'); // Busca en el h2 .saldo del archivo menu.html y Agrega $

    if ($elementoSaldo.length > 0) {
        var saldoNumero = Number(saldo); // Para validar que Saldo es Número 
        $elementoSaldo.text('$' + formatearNumero(saldoNumero));
    }
}

function formatearNumero(numero) {
    return Number(numero).toLocaleString('es-CL'); // Para mostrar como numero y de forma amigable para chile
}

function redirigirDeposito() {
    alert('Redirigiendo a Depositar...'); // Muestra ventana de alerta
    setTimeout(function () {
        window.location.href = 'deposit.html';
    }, 500); // Medio seg de retraso para dar respiro a la interacción
}

function redirigirEnviar() {
    alert('Redirigiendo a Enviar Dinero...');
    setTimeout(function () {
        window.location.href = 'sendmoney.html';
    }, 500);
}

function redirigirMovimientos() {
    alert('Redirigiendo a Últimos Movimientos...');
    setTimeout(function () {
        window.location.href = 'transactions.html';
    }, 500);
}

// PARA DEPÓSITO
function realizarDeposito(event) {
    event.preventDefault();

    var $monto = $('#montoDeposito').val();

    if ($monto <= 0 || $monto === '') {
        var alertaError = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>¡Error!</strong> El monto debe ser mayor a 0.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        $('#montoDepositado').html(alertaError).show();
        return;
    }

    // Obtener saldo actual
    var saldoActual = Number(localStorage.getItem('saldo'));
    var nuevoSaldo = saldoActual + Number($monto);

    // Guardar nuevo saldo
    localStorage.setItem('saldo', nuevoSaldo);

    // Registrar movimiento
    registrarMovimiento('Depósito Bancario', $monto, 'deposito');

    // Mostrar leyenda con el monto depositado
    var leyendaMonto = `
        <div class="alert alert-info">
            <strong>Monto depositado:</strong> $${formatearNumero($monto)}
        </div>
    `;
    $('#montoDepositado').html(leyendaMonto).show();

    // Alerta de éxito
    var alertaExito = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>¡Éxito!</strong> Depósito realizado. Nuevo saldo: $${formatearNumero(nuevoSaldo)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    $('#montoDepositado').append(alertaExito);

    // Redirigir después de 2 segundos
    setTimeout(function () {
        window.location.href = 'menu.html';
    }, 2000);
}

// Mostrar saldo actual en el deposito
function mostrarSaldoActual() {
    var saldo = localStorage.getItem('saldo');
    var saldoFormateado = '$' + formatearNumero(saldo);

    $('#saldoActual').html('<strong>Tu saldo actual es:</strong> ' + saldoFormateado);
}



// PARA ENVIAR DINERO
var contactoSeleccionado = ''; // Variable Global

function seleccionarContacto(nombre, elemento) {
    contactoSeleccionado = nombre;
    
    $('.contacto').removeClass('contacto-seleccionado'); // Quita selección previa
    $(elemento).addClass('contacto-seleccionado'); // Agregar clase al contacto clickeado
    $('#btnEnviarDinero').show(); // Mostrar botón de envío
}

function enviarDinero(event) {
    event.preventDefault(); // Detiene el envío automático o recargar la pag.

    var $monto = $('#montoEnviar').val(); // se reemplaza ( var monto = document.querySelector('#modalEnviar input[type="number"]').value; ) por jquery
    var saldoActual = Number(localStorage.getItem('saldo'));

    if ($monto <= 0) {
        alert('El monto debe ser mayor a 0');
        return;
    } // Evita cantidades negativas o iguales a 0

    if (Number($monto) > saldoActual) {
        alert('Saldo insuficiente');
        return;
    } // Evita envio mayor al saldo

    // Restar el monto del saldo
    var nuevoSaldo = saldoActual - Number($monto);
    localStorage.setItem('saldo', nuevoSaldo);

    // Registrar movimiento
    registrarMovimiento('Envío a ' + contactoSeleccionado, $monto, 'envio');

    alert('Dinero enviado exitosamente a ' + contactoSeleccionado + '\nNuevo saldo: $' + formatearNumero(nuevoSaldo)); //muestra por pantalla el envio
    window.location.href = 'menu.html'; // Vuelve al Menu
}

// Agregar nuevos Contactos

function agregarContacto(event) {
    event.preventDefault();  // Detiene el envío automático o recargar la pag.

    var nombre = $('#nombreContacto').val(); // Nombre Completo
    var alias = $('#aliasContacto').val(); // Alias
    var banco = $('#bancoContacto').val(); // Banco
    var cuenta = $('#cuentaContacto').val(); // Numero de Cuenta
    var email = $('#emailContacto').val(); // Email

    if (nombre && alias && banco && cuenta && email) {
        if (cuenta.length < 10) {
            alert('El número de cuenta debe tener al menos 10 dígitos');
            return;
        }

        // Crear el nuevo contacto HTML
        var nuevoContactoHTML = `
            <div class="contacto" data-alias="${alias.toLowerCase()}" onclick="seleccionarContacto('${nombre}', this)">
                <strong>${nombre}</strong><br>
                <small>Alias: ${alias}</small><br>
                <small>Banco: ${banco}</small><br>
                <small>Numero de cuenta: ${cuenta}</small><br>
                <small>Tipo de cuenta: Vista</small><br>
                <small>${email}</small>
            </div>
        `;

        $('#listaContactos').append(nuevoContactoHTML); // Agrega el contacto a la lista
        alert('Contacto agregado: ' + nombre);
        
        // Cerrar modal
        var modal = bootstrap.Modal.getInstance(document.getElementById('modalContacto'));
        modal.hide();

        // Limpiar formulario
        $('#formContacto')[0].reset();
    } else {
        alert('Completa todos los campos');
    } // Comprueba que se llenen todos los datos
}


// PARA BUSCAR CONTACTOS
function buscarContacto() {
    var termino = $('#buscarInput').val().toLowerCase();
    
    $('.contacto').each(function() {
        var nombreContacto = $(this).find('strong').text().toLowerCase();
        var aliasContacto = $(this).attr('data-alias') ? $(this).attr('data-alias').toLowerCase() : '';
        
        if (nombreContacto.includes(termino) || aliasContacto.includes(termino) || termino === '') {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

// PARA MOVIMIENTOS
function registrarMovimiento(descripcion, monto, tipo) {
    var movimientos = JSON.parse(localStorage.getItem('movimientos')); // Recupera la informacion en texto y la transforma a Array

    var fecha = new Date();
    var fechaTexto = fecha.toLocaleDateString('es-CL') + ', ' + fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    var nuevoMovimiento = {
        descripcion: descripcion,
        monto: monto,
        tipo: tipo,
        fecha: fechaTexto
    }; // Guarda informacion del movimiento

    movimientos.unshift(nuevoMovimiento);  // 'unshift' agrega la información al inicio del array, para que lo ultimo ingresado siempre este arriba.


    if (movimientos.length > 5) {
        movimientos = movimientos.slice(0, 5);
    } // Guardar solo los últimos 5 movimientos

    localStorage.setItem('movimientos', JSON.stringify(movimientos)); // Convierte a texto y lo registra en el localStore
}

// Mostrar el historial 
function mostrarMovimientos() {
    var movimientos = JSON.parse(localStorage.getItem('movimientos')); // Extrae la lista del localStore
    var $listaMovimientos = $('.list-group'); // se reemplaza ( var listaMovimientos = document.querySelector('.list-group'); ) por jquery

    if ($listaMovimientos.length > 0 && movimientos && movimientos.length > 0) {
        $listaMovimientos.empty(); // Limpiar lista actual para no duplicar datos

        // Agregar movimientos guardados

        movimientos.forEach(function (mov) { // 'forEach' hace que repita la accion por cada movimiento
            var $li = $('<div>').addClass('movimiento').html(` 
               <p class="tipo_transaccion">${mov.descripcion}</p>
               <p class="fecha_transacion">${mov.fecha}</p>
               <div class="${mov.tipo === 'deposito' ? 'text-success' : 'text-danger'} fw-bold">
                  ${mov.tipo === 'deposito' ? '+' : '-'}$${formatearNumero(mov.monto)}
               </div>
            `);
            $listaMovimientos.append($li);
        });
    }
}

//PARA FILTRAR MOVIMIENTOS
function filtrarMovimientos() {
    var filtro = $('#filtroTipo').val();
    var movimientos = JSON.parse(localStorage.getItem('movimientos'));
    var $listaMovimientos = $('.list-group');

    if ($listaMovimientos.length > 0 && movimientos && movimientos.length > 0) {
        $listaMovimientos.empty();

        movimientos.forEach(function (mov) {
            // Filtrar según el tipo seleccionado
            if (filtro === 'todos' || mov.tipo === filtro) {
                var $li = $('<li>').addClass('movimiento').html(`
                    <p class="tipo_transaccion">${mov.descripcion}</p>
                    <p class="fecha_transacion">${mov.fecha}</p>
                    <div class="${mov.tipo === 'deposito' ? 'text-success' : 'text-danger'} fw-bold">
                        ${mov.tipo === 'deposito' ? '+' : '-'}$${formatearNumero(mov.monto)}
                    </div>
                `);
                $listaMovimientos.append($li);
            }
        });
    }
}

//PARA CERRAR SESIÓN
function cerrarSesion() {
    var confirmar = confirm('¿Estás seguro que deseas cerrar sesión?');
    if (confirmar) {
        localStorage.removeItem('usuarioLogueado'); // Borra el local al cerrar sesion
        alert('Sesión cerrada exitosamente');
        window.location.href = 'login.html';
    }
}

