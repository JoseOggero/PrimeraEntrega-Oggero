const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8080;

app.use(express.json());

const productsRouter = express.Router();

// Ruta GET /api/products/
productsRouter.get('/', (req, res) => {
  const limit = req.query.limit || 10;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer los productos');
    } else {
      const products = JSON.parse(data);
      res.json(products.slice(0, limit));
    }
  });
});

// Ruta GET /api/products/:pid
productsRouter.get('/:pid', (req, res) => {
  const productId = req.params.pid;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer los productos');
    } else {
      const products = JSON.parse(data);
      const product = products.find((p) => p.id === productId);
      if (product) {
        res.json(product);
      } else {
        res.status(404).send('Producto no encontrado');
      }
    }
  });
});

// Ruta POST /api/products/
productsRouter.post('/', (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer los productos');
    } else {
      const products = JSON.parse(data);
      const newProduct = {
        id: uuidv4(),
        title,
        description,
        code,
        price,
        status: status !== undefined ? status : true,
        stock,
        category,
        thumbnails,
      };
      products.push(newProduct);

      fs.writeFile('productos.json', JSON.stringify(products), (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error al agregar el producto');
        } else {
          res.json(newProduct);
        }
      });
    }
  });
});

// Ruta PUT /api/products/:pid
productsRouter.put('/:pid', (req, res) => {
  const productId = req.params.pid;
  const updatedFields = req.body;

  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer los productos');
    } else {
      const products = JSON.parse(data);
      const productIndex = products.findIndex((p) => p.id === productId);
      if (productIndex !== -1) {
        const updatedProduct = { ...products[productIndex], ...updatedFields };
        products[productIndex] = updatedProduct;

        fs.writeFile('productos.json', JSON.stringify(products), (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error al actualizar el producto');
          } else {
            res.json(updatedProduct);
          }
        });
      } else {
        res.status(404).send('Producto no encontrado');
      }
    }
  });
});

// Ruta DELETE /api/products/:pid
productsRouter.delete('/:pid', (req, res) => {
  const productId = req.params.pid;

  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer los productos');
    } else {
      let products = JSON.parse(data);
      const productIndex = products.findIndex((p) => p.id === productId);
      if (productIndex !== -1) {
        const deletedProduct = products[productIndex];
        products = products.filter((p) => p.id !== productId);

        fs.writeFile('productos.json', JSON.stringify(products), (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error al eliminar el producto');
          } else {
            res.json(deletedProduct);
          }
        });
      } else {
        res.status(404).send('Producto no encontrado');
      }
    }
  });
});

app.use('/api/products', productsRouter);

const cartsRouter = express.Router();

// Ruta POST /api/carts/
cartsRouter.post('/', (req, res) => {

  fs.readFile('carrito.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer el carrito');
    } else {
      const carts = JSON.parse(data);
      const newCart = {
        id: uuidv4(),
        products: [],
      };
      carts.push(newCart);

      fs.writeFile('carrito.json', JSON.stringify(carts), (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error al crear el carrito');
        } else {
          res.json(newCart);
        }
      });
    }
  });
});

// Ruta GET /api/carts/:cid
cartsRouter.get('/:cid', (req, res) => {
  const cartId = req.params.cid;

  fs.readFile('carrito.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer el carrito');
    } else {
      const carts = JSON.parse(data);
      const cart = carts.find((c) => c.id === cartId);
      if (cart) {
        res.json(cart.products);
      } else {
        res.status(404).send('Carrito no encontrado');
      }
    }
  });
});

// Ruta POST /api/carts/:cid/product/:pid
cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1; 
  fs.readFile('carrito.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer el carrito');
    } else {
      let carts = JSON.parse(data);
      const cartIndex = carts.findIndex((c) => c.id === cartId);
      if (cartIndex !== -1) {
        const cart = carts[cartIndex];
        const productIndex = cart.products.findIndex((p) => p.product === productId);
        if (productIndex !== -1) {
          cart.products[productIndex].quantity += quantity; 
        } else {
          cart.products.push({ product: productId, quantity }); 
        }
       
        fs.writeFile('carrito.json', JSON.stringify(carts), (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error al agregar el producto al carrito');
          } else {
            res.json(cart.products);
          }
        });
      } else {
        res.status(404).send('Carrito no encontrado');
      }
    }
  });
});

app.use('/api/carts', cartsRouter);

