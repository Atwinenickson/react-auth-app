const express = require('express')
require('dotenv').config();

const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const checkScope = require('express-jwt-authz');

var checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
      jwksUri: `https://${
        process.env.REACT_APP_AUTH0_DOMAIN
    }/.well-known/jwks.json`,
  }),
  audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

const app = express()



app.get('/public', function (req, res) {
    res.json({
        message: "hello from api"
    });
}
);

app.get("/private", checkJwt, function (req, res) {
  res.json({
    message: "hello from private api",
  });
});

function checkRole(role) {
  return function (req, res, next) {
    const assignedRoles = req.user["http://localhost:3000/roles"];
    if (Array.isArray(assignedRoles) && assignedRoles.includes(role)) {
      return next();
    } else {
      return res.status(401).send("Insufficient role");
    }
  };
}


app.get("/course", checkJwt, checkScope(["read:courses"]), function (req, res) {
  res.json({
    courses: [
      { id: 1, title: "building apps with redux" },
    { id: 2, title: "creating reusable react components" }  
    ]
  });
});


app.get("/admin", checkJwt, checkRole('admin') ,function (req, res) {
  res.json({
    message: "hello from admin api",
  });
});


app.listen(3001);
console.log("API server listening on" + process.env.REACT_APP_AUTH0_AUDIENCE)