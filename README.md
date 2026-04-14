# Pruebas de Contrato de Microservicios

Este proyecto contiene tres servicios en Node.js que usan Docker Compose para ejecutar:

- `licencias` (servicio provider)
- `portal-paciente` (consumer)
- `validador-aseguradora` (consumer)
- `mariadb` como base de datos MySQL

El repositorio también incluye pruebas de contrato con Pact y validación del provider.

---

## Requisitos previos

- Docker
- Docker Compose
- Node.js / npm (si desea ejecutar pruebas localmente fuera de contenedores)

---

## Levantar los contenedores principales

1. Abrir una terminal en la raíz del proyecto.
2. Ejecutar:

```bash
docker compose up -d licencias portal-paciente validador-aseguradora
```

Esto iniciará los siguientes servicios:

- `mariadb` en el puerto `3307` del host
- `licencias` en el puerto `3000`
- `portal-paciente` en el puerto `3002`
- `validador-aseguradora` en el puerto `3003`

3. Verificar el estado:

```bash
docker compose ps
```

---

## Detener y eliminar los contenedores

```bash
docker compose down
```

---

## Ejecutar las pruebas de contrato (Pact)

### 1. Generar pacts de los consumers

Los tests de consumidor generan los archivos Pact JSON dentro de `licencias/pacts`.

```bash
docker compose run --rm consumer-tests-licencias

docker compose run --rm consumer-tests-portal

docker compose run --rm consumer-tests-validador
```

### 2. Verificar el provider de licencias

Después de generar los pacts, ejecutar la verificación del provider:

```bash
docker compose run --rm verify-licencias
```

> Nota: `verify-licencias` requiere que `mariadb` esté en ejecución y que los contratos Pact ya existan en `licencias/pacts`.

---

## Comandos útiles por servicio

### Licencias

```bash
cd licencias
npm install
npm run start
npm run dev
npm run test
npm run test:pact
```

### Portal Paciente

```bash
cd portal-paciente
npm install
npm run start
npm run dev
npm run test:pact
```

### Validador Aseguradora

```bash
cd validador-aseguradora
npm install
npm run start
npm run dev
npm run test:pact
```

---

## Endpoints principales

- Servicio `licencias`: http://localhost:3000
- Servicio `portal-paciente`: http://localhost:3002
- Servicio `validador-aseguradora`: http://localhost:3003

---

## Observaciones

- La base de datos MariaDB se inicializa automáticamente con `licencias/src/db/migrate.sql`.
- El servicio `licencias` depende de la base de datos y no arrancará hasta que `mariadb` esté saludable.
- Los consumers usan `http://licencias:3000` dentro de la red Docker para comunicarse con el servicio de licencias.

---

## Desafios y complicaciones en el desarrollo

Durante el desarrollo de la actividad se presentaron dificultades en las rutas definidas en los scripts de ejecucion dados que muchas veces el sistema no identificaba directamente la carpeta de consumidor y procedia a ejecutar todas las pruebas (`consumer, provider y unit`), por lo que finalmente se definieron la rutas relativas en vez de usar busqueda de patrones. Otra dificultad presente era la ejecucion de verificacion del proveedor, la cual no podia pasar las pruebas debido a un error en la programacion de `license.repository.js` el cual contenia el codigo del servicio y posterior a la revision del error se arreglo. Por ultimo una confusión en lo solicitado en la actividad, la estructura de las licencias, y formato de algunos atributos.