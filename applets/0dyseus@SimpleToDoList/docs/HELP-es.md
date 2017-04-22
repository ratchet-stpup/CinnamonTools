
# Ayuda para el applet Simple Lista de Tareas

### ¡IMPORTANTE!
Jamás borrar ninguno de los archivos encontrados dentro de la carpeta de este xlet. Podría romper la funcionalidad del xlet.

***

<h2 style="color:red;">Reportes de fallos, peticiones de características y contribuciones</h2>
<span style="color:red;">
Si cualquiera tiene fallos que reportar, peticiones de características y contribuciones, deben realizarlas <a href="https://github.com/Odyseus/CinnamonTools">en la página de GitHub de este xlet</a>.
</span>

***

### Uso del applet

El uso de este applet es muy simple. Cada lista de tareas está representada por un submenú y cada submenú ítem dentro de un submenú representa una tarea.

- Para agregar una nueva lista de tareas, simplemente hacer foco en la entrada **Nueva lista de tareas...**, darle un nombre a la lista y presionar <kdb>Enter</kdb>.
- Para agregar una nueva tarea, simplemente hacer foco en la entrada **Nueva tarea...**, darle un nombre a la tarea y presionar <kdb>Enter</kdb>.
- Todas las listas de tareas y las tareas pueden ser editadas .
- Tareas pueden ser marcadas como completadas cambiando el estado de marcado de los elementos del submenú.
- Las tareas se pueden ordenadas simplemente arrastrándolas dentro de la lista de tareas a la que pertenecen.
- Cada lista de tareas puede tener sus propias opciones de orden de tares (por nombre y/o por estado completado), para establecer la visibilidad del botón de borrar tarea y para la visibilidad de tareas completadas.
- Cada lista de tareas puede ser guardada como archivos TODO individuales y también pueden ser expotadas a un archivo para propósitos de respaldo.
- Tareas pueden ser re-ordenadas simplemente arrastrándolas dentro de la lista de tareas a las que pertenecen (sólo si las opciones de ordenamiento automático para la lista de tareas están desactivadas).
- Las tareas se pueden eliminar simplemente pulsando el botón de borrar tarea (si es visible).
- Soporte para etiquetas de prioridad colorizadas. El color de fondo y texto de una tarea puede ser coloreado dependiendo de la @etiqueta encontrada dentro del texto de una tarea.
- Atajo de teclado configurable para abrir/cerrar el menú.
- Leer las cajas de herramientas de cada opción en la ventana de preferencias de este applet para más detalles.

***

### Atajos de teclado

La navegación del teclado dentro del este menú de applet es muy similar a la navegación por teclado utilizada por cualquier otro menú de Cinnamon. Pero ha sido cambiada ligeramente para facilitar el manejo y edición de tareas y listas de tareas.

##### Cuando el foco se encuentra en una tarea

- <kdb>Ctrl</kdb> + <kdb>Barra Espaciadora</kdb>: Activa o desactiva el estado completado (marcado) de una tarea.
- <kdb>Shift</kdb> + <kdb>Borrar</kdb>: Elimina una tarea y enfoca el elemento en la parte superior de la tarea eliminada.
- <kdb>Alt</kdb> + <kdb>Borrar</kdb>: Elimina una tarea y enfoca el elemento debajo de la tarea eliminada.
- <kdb>Ctrl</kdb> + <kdb>Flecha Arriba</kdb> or <kdb>Ctrl</kdb> + <kdb>Flecha Abajo</kdb>: Mueve una tarea dentro de su lista (submenú).
- <kdb>Insertar</kdb>: Enfocará la entrada de texto "Nueva tarea..." de la sección actualmente abierta.

##### Cuando el foco se encuentra en una sección

- <kdb>Flecha Izquierda</kdb> y <kdb>Flecha Derecha</kdb>: Si la lista de tareas (submenú) está cerrada, estas teclas abrirán el submenú. Si el submenú está abierto, estas teclas moverán el cursor dentro de la etiqueta del submenú para permitir la edición del texto de la sección.

##### Cuando el foco se encuentra en la entrada "Nueva tarea..."

- <kdb>Ctrl</kdb> + <kdb>Barra Espaciadora</kdb>: Esta combinación de teclas cambia la visibilidad del menú de opciones de la lista de tareas.
- <kdb>Insert</kdb>: Enfocará la entrada de texto "Nueva tarea..." de la sección. Si submenú de la sección no está abierto, dicho submenú será abierto.

***

### Problemas conocidos

- **Pasar el ratón sobre elementos dentro del menú no resalta los elementos del menú ni los submenús:** Esto es realmente una característica deseada. Al permitir que los elementos sean resaltados por el ratón podría hacer que las entradas pierdan el foco, resultando en la imposibilidad de seguir escribiendo texto dentro de ellas y obligándonos constantemente a mover el cursor del ratón para recuperar el foco.
- **Las entradas de texto de tareas lucen incorrectamente:** Las entradas de texto de tareas en este applet tienen la capacidad de envolver su texto en caso de que se establezca un ancho fijo para ellas. También pueden ser multilínea (<kdb>Shift</kdb> + <kdb>Enter</kdb> dentro de una entrada de texto creará una nueva linea). Algunos temas de Cinnamon, como los de la familia de temas Mint-X que vienen por defecto, establecen un ancho y una altura fija para entradas de texto dentro de menúes. Estas medidas fijas hacen imposible que se pueda establecer programáticamente un ancho deseado para las entradas de texto (al menos, yo no pude encontrar una manera de hacerlo). Y la altura fija no permite que las entradas de texto se expandan, completamente rompiendo la capacidad de las entradas de texto de envolver su texto y de ser multilínea.

#### Así es como las entradas de texto deberían lucir

![Estilo correcto para entradas de texto](./assets/00-correct-entries-styling.png)

#### Así es como las entradas de texto NO DEBERÍAN lucir

![Estilo incorrecto para entradas de texto](./assets/00-incorrect-entries-styling.png)

La única manera de arreglar esto (que yo he podido encontrar) es editando el tema de Cinnamon que uno está usando y remover esas medidas fijas. Los selectores CSS que necesitan ser editados son **.menu StEntry**, **.menu StEntry:focus**, **.popup-menu StEntry** y **.popup-menu StEntry:focus**. Dependiendo para qué versión de Cinnamon el tema fue creado, uno puede encontrar sólo los primeros dos selectores, los últimos dos o todos ellos. Las propiedades CSS que necesitan ser editadas son **width** y **height**. Ellas podrían ser eliminadas, pero lo más sensible de hacer es renombrarlas a **min-width** y **min-height** respectivamente. Luego de editar el archivo del tema y reiniciar Cinnamon, las entradas de texto de este applet deberían lucir y funcionar correctamente.

***

### Localización de applets/desklets/extensiones (también conocidos como xlets)

- Si este xlet se instaló desde Configuración de Cinnamon, todas las localizaciones de este xlet se instalaron automáticamente.
- Si este xlet se instaló manualmente y no a través de Configuración de Cinnamon, las localizaciones se pueden instalar ejecutando el archivo llamado **localizations.sh** desde una terminal abierta dentro de la carpeta del xlet.
- Si este xlet no está disponible en su idioma, la localización puede ser creada siguiendo [estas instrucciones](https://github.com/Odyseus/CinnamonTools/wiki/Xlet-localization) y luego enviarme el archivo .po.
    - Si se posee una cuenta de GitHub:
        - Puede enviar una "pull request" con el nuevo archivo de localización.
        - Si no se desea clonar el repositorio, simplemente crear un [Gist](https://gist.github.com/) y enviarme el enlace.
    - Si no se posee o no se quiere una cuenta de GitHub:
        - Se puede enviar un [Pastebin](http://pastebin.com/) (o servicio similar) a mi [cuenta en el foro de Linux Mint](https://forums.linuxmint.com/memberlist.php?mode=viewprofile&u=164858).
- Si el texto fuente (en Inglés) y/o mi traducción al Español contiene errores o inconsistencias, no dude en informarlos.
