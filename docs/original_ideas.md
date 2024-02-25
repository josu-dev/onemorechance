# Ideas

## Secuencia

### Pantalla de inicio

OPCIONES EN LA PANTALLA

- Crear Sala
- Unirse a la sala( Pide el codigo de la sala)
- Crear Deck

### Crear Deck

- El jugador tendra la opcion de crear frases y un listado de palabras para completar las tematicas
- Podra elegir tags y demas palabras clave que identifiquen el deck

### Sala de espera

- Sala de espera con los jugadores para arrancar la partida
- Configuracion de la partida
  - Cantidad de rondas
  - Timers
  - Seleccionar deck a utilizar
  - Cantidad de cartas u opciones
- Todos los jugadores deben confirmar el inicio de partida y el lider la comienza

### Loop de juego

1. Cada jugador recibe opciones o cartas.
1. Se muestra una frase
1. Empieza el contador para que cada jugador seleccione una opcion para completar la frase
1. Se muestra cada una de las frases completadas por cada jugador, con su respectiva opcion de Like(suma 1),Meh(suma 0), Dislike (resta 1) para puntuar el chiste.
1. Se muestran los puntajes obtenidos por cada jugador
1. SI NO ES LA ULTIMA RONDA Todos los jugadores reciben una opcion nueva para reemplazar la utilizada.
1. Los que estan ultimos , pueden elegir descartar una carta y tomar otra mientras los otros esperan. ( Esperando al perdedor... )
1. SI currentRound < roundsPerGame
  - Utilizar algun modificador en caso de querer, confirmar y pasar al proximo round > Volver al paso 1
  - SINO
  - Se muestran los puntaje con top 3 ( Con el ultimo es el subsuelo)
1. Puntuar el deck para recomendar a los demas usuarios

### Reglas

- El ganador sera aquel que termine con el numero mas alto de puntos
- El perdedor(ultimo o ultimos de la ronda) recibira una bonificacion en cada una de las rondas

### Modificadores

- (Previo a la ronda) Jugador durante la ronda puede completar la frase con cualquier palabra que quiera. SI
- (Previo a la ronda) Elegir frase, el jugador puede crear su propia frase a completar por los jugadores. SI
- (Previo a la ronda) Eliminar permanentemente una carta de cada jugador y no puede elegir otra. NO
- (Previo a la ronda) Reducir a la mitad. SI
- (Previo a la ronda) Mezclar todas las opciones de nuevo. SI
- (Previo a la ronda) Multiplicador de puntos para el jugador. SI
- (Previo,durante la ronda) Intercambiar opciones con algun jugador.
- (Previo,durante la ronda) Quitarle una opcion aleatoria a todos los jugadores,o a uno.
- (Durante la ronda) Permitir que el jugador utilice 2 cartas para completar la frase y que posteriormente se elija la mejor.
- (Durante la ronda) Elegirle la opcion a otro para arruinarle la frase.
- (Durante la ronda) No dejar elegir la primer opcion al jugador.

Anonimo?

Que jugadores obtienen bonificadores?

## Road Map

La prioridad va de 1 a 3, siendo 1 la mas alta.

### PROGRAMACION

- Crear sala 1
  - Conectarse a una sala 1
  - Configurar sala 3
    - Elegir deck 3
      - Cantidad de rounds 3
      - Timers 3
      - Cantidad de cartas u opciones 3
- Armar juego
  - Mostrar cartas disponibles de cada jugador 2
  - Mostrar frase 2
  - Completar frase 2
  - Puntuar frases  2
  - Mostrar leaderboard 2
  - Repartir mas cartas 2
  - Repartir cartas para los que estan perdiendo 3
  - Manejar modificadores obtenidos previo a la ronda 3
  - Manejar modificadores durante la ronda 3

- Crear Decks 3
  - Agregar frases 3
  - Agregar opciones 3
  - Publicar deck 3
  - Editar deck 3
  - Eliminar deck 3


## Decks por defecto en el juego

### Categorias
- Family Friendly
- Humor negro (30 frases , 210 opciones)
  - Si pudiera tener cualquier superpoder, elegiría ...
  - No puedo creer que mi [familiar] haya muerto por culpa de ...
  - La mejor forma de relajarme es ...
  - Mi solucion para el hambre en africa es ...
  - Mejor forma de matar a un discapacitado ...
  - Me rompi la pierna pero por lo menos no ...
  - La ultima vez que termine en el hospital fue por ...
  - Perdi la vision del ojo porque ...
  - Que ganas de ...
  - Al ultimo que me debia plata le hice ...
  - Tuve que ponerle fin a mi relacion culpa de
  - Si fuera dios por un dia ...
  - Si despertara con el sexo opuesto lo primero que haria es ...
  - Si todo fuera legal haria ...
  - En el medio del desierto le pedi a dios que ...
  - Si ... el mundo seria mas feliz
  - No podria vivir sin ...
  - Lo primero que pienso en el dia es ...
  - El doctor me dijo que mi enfermedad no tiene cura culpa de ...
  - Me duele el culo porque ...
  - Tengo fe de que ocurra ...
  - No soy gay pero ... me banco
  - En mi cumple mi tio me sorprendio con ...
  - Alla la estan ...
  - Que ganas de ir al cementerio a ...
  - El otro dia me cruce a tu amigo me dijo que ...
  - La mejor contrasena es ...
  - Consegui ... a cambio de ...
  - Quiero que en mi tumba diga ...
  - Si pudiera pedir 3 deseos serian ..., ..., ...
  - Seria 1ro en un concurso de
  - La mejor forma de morir seria ...
  - Que ganas de cojerme a ...
  - Mi profesor de matematicas me dijo que estoy con los numeros primos... yo le respondi Que decis solo estoy pensando en ...
  - Le conte a mi abuelita que queria ser comediante me dijo “Ah como tu tio que siempre esta contando chistes sobre ...
  - Opciones
    - Viejas putas
    - Me coji al chavo
    - Pelar pijas con la cola
    - Lluvia de pijas
    - Vieja
    - Una paja en el micro
    - Puto
    - Peronista
    - Otaku
    - Libertario
    - La mama de (Selecciona el nombre de un jugador)
    - Romper el orto
    - Papa
    - Cura
    - Banana
    - Down
    - Mitomano
    - Hitler
    - Nazi
    - Fimosis
    - Rompio el frenillo
    - Ereccion
    - Dedaso en el orto
    - Cancer
    - Cocaina
    - Porno gay
    - Crear un juego porno multijugador
    - Hermana
    - Conoci un trava
    - Deje llevar
    - Intente frenar un camion con la pija
    - Pense que podia aguantar dos kilos colgando de las bolas
    - Viejo
    - Tio
    - Stalin
    - Mussolini
    - Diarrea
    - Sifilis
    - Gonorrea
    - Sida
    - Boliviano
    - Cagadera
    - Onichan
    - Culeando
    - Gozando
    - No se banco 2 tiros en la cabeza
    - Darle para que tenga
    - Cipayo
    - Que ganas que me cojan en el counter
    - Gordo virgen
    - La concha de tu vieja
    - No se , pero como te chuparia todo el orto
    - Cogerme [Elegir jugador]
    - Estar con la hermana de [Elegir jugador]
    - Judio
    - Hornos
    - Arabes
    - Koreanos
    - Chinos de mierda
    - A caballito
    - El viejo verde
    - concha de la lora
    - gomazos limpio
    - Puntito caramelo
    - A todo culo
    - Abortera
    - Abuso
    - ACM1PT
    - Panflin
    - AFA AFA AFA AFA AFAAERTEEEE
    - Agarra una pala y deja de jugar esta cagada
    - Amigarcha
    - Amasijar la nutria
    - Pajero
    - Pajin
    - Trio de negras
    - Petardo
    - Pija dulce
    - Pregúntale a tu vieja
    - Squirt de culo
    - No se pero la anterior fue malisima.
    - Waskaso
    - Chotito
    - Chorizo
    - Chonguito
    - Garchado
    - Poringa
    - Chupame la pija
    - Que cartas de mierda che!
    - Comegato
    - esnifa penes
    - Conchuda
    - Cornudo
    - Infidelidad
    - Consumir cocaina
    - Violar
    - El diego
    - Colarse un vaso en el orto
    - Esnifar merca del culo de un enano
    - Comerse a una menor
    - Ir a un jardin de infantes
    - Pajaso
    - Drogas
    - Sexo interracial
    - Furros
    - Zoofilia
    - Doble penetracion
    - Milf
    - vulva
    - testiculo
    - Cancer
    - Holocausto
    - Auschwitz
    - Terremoto de chotas
    - Tsunami fluido vaginal
    - Atentado a playboy
    - Bomba en villa 1 11 14
    - Suicidio
    - Genocidio
    - Violación
    - Racismo
    - Xenofobia
    - Pobreza
    - Amputación de verga
    - Vacunado
    - Pedofilia
    - Incesto
    - Necrofilia
    - Canibalismo
    - Esclavizar un nene hindu
    - Succionar legos con el orto
    - Macri
    - De hecho eso lo vi en pornhub
    - Mamba negra
    - Nene africano
    - Sobredosis de coito
    - Eyacular en la comida
    - Eyacular
    - La profe de matematica
    - La vecina
    - Telettubie
    - Manda fruta
    - Tenedor anal
    - Trompeta de leche
    - El 9 de lanus
    - Gargara de semen
    - Cata porongas
    - Examen de prostata
    - Infla chotas
    - Calentador de huerfanas
    - Camion Iveco lleno de prostitutas
    - Goloso
    - uyy la puse a la vieja
    - Terrorismo de choripanes
    - Termotanque de sida
    - Flequillo de carne
    - Centrifugador de ortos
    - Asaltador de virginidades
    - Eyaculador precoz
- Refranes inventados
  - Más aburrido que ...
  - Más perdido que ...
  - Más vale tarde que ...
  - Más contento que ...
  - No hay mal que ...
  - A caballo regalado ...
  - Más vale prevenir que ...
  - Más vale pájaro en mano que ...
  - Más vale maña que ...
  - Más viejo que ...
  - A todo chancho ...
  - A la corta o a la larga ...
  - A este le dicen Zapata ...
  - Más peligroso que ...
  - Más enredado ...
  - Más loco que ...
  - Más desordenado que ...
  - Más lento que ...
  - Más distraído ...
  - Más complicado que ...
  - Mas suertudo que ...
  - Más claro que ...
  - Más duro que ...
  - Más rápido que ...
  - Más sano que ...
  - Más bueno que ...
  - Más rico que ...
  - Más sabio que ...
  - Más fuerte que ...
  - Más raro que ...
  - Más falso que ...
  - Más fácil que ...
  - Más caro que ...
  - Más seguro que ...
  - Más feliz que ...
  - Más grande que ...
- Family friendly
  - El mejor regalo que recibí en Navidad fue un ...
  - Nunca saldría con alguien que le guste ...
  - Mi sueño es viajar por el mundo y conocer ...
  - Si pudiera tener un superpoder, sería ...
  - Lo que más me gusta de mi trabajo es ...
  - Mi película favorita es ..., porque ...
  - La última vez que me reí mucho fue cuando ...
  - Mi mayor miedo es ...
  - Si ganara la lotería, lo primero que haría sería ...
  - Mi comida favorita es ..., pero no me gusta ...
  - Mi hobby más raro es ...
  - Lo que más me molesta de la gente es ...
  - Mi animal favorito es ..., porque ...
  - Mi deporte favorito es ..., pero soy malo/a en ...
  - Mi lugar favorito para relajarme es ...
  - Mi programa de televisión favorito es ..., porque ...
  - Mi libro favorito es ..., porque ...
  - Mi canción favorita es ..., porque ...
  - Mi color favorito es ..., porque ...
  - Mi flor favorita es ..., porque ...
  - Mi estación favorita es ..., porque ...
  - Mi juego de mesa favorito es ..., porque ...
  - Mi juego de cartas favorito es ..., porque ...
  - Mi helado favorito es ..., porque ...
  - Mi postre favorito es ..., porque ...
  - Mi bebida favorita es ..., porque ...
  - Mi fruta favorita es ..., porque ...
  - Mi verdura favorita es ..., porque ...
  - Mi condimento favorito es ..., porque ...
  - Mi marca de ropa favorita es ..., porque ...
  - Mi estilo de música favorito es ..., porque ...
  - Mi artista favorito es ..., porque ...
  - Mi actor/actriz favorito/a es ..., porque ...
  - Mi personaje de ficción favorito es ..., porque ...
  - Cuando veo ..., me siento como en casa
