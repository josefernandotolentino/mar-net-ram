﻿import A = require("../ProjetoA/A");

 export function valor(){
     
     var html = 'app.ts - iniciado com sucesso<br>';

     var a = new A.ClasseA();
     html = html + a.hola();
     return html;
 };

