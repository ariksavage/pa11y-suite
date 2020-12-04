'use strict';

function tableOpen(headers, classes = null, id = null) {
  var table = `<table id="${id}" class="${classes}">`;
  table += '<thead>';
  table += '<tr>';
  headers.forEach(header => {
    table += `<th>${header}</th>`;
  });
  table += '</tr>';
  table += '</thead>';
  table += '<tbody>';
  return table;
}

function tableClose(){
  return '</tbody></table>';
}

function tableRow(cells){
  var row = '<tr>';
  cells.forEach(cell => {
    row += `<td>${cell}</td>`;
  });
  row += '</tr>';
  return row;
}

function heading(text, l, size, style = ''){
  return `<h${l}>${text}</h${l}>`;
}

function h1(text){
  return heading(text, 1, 25);
}

function h2(text){
  return heading(text, 2, 25);
}

function h3(text){
  return heading(text, 3, 16);
}

function h4(text){
  return heading(text, 4, 14);
}

function h5(text){
  return heading(text, 5, 14, 'text-transform: uppercase;');
}

function p(text, style=''){
  return `<p>${text}</p>`;
}

function li(text, style=''){
  return `<li>${text}</li>`;
}

exports.tableOpen = tableOpen;
exports.tableClose = tableClose;
exports.tableRow = tableRow;
exports.h1 = h1;
exports.h2 = h2;
exports.h3 = h3;
exports.h4 = h4;
exports.h5 = h5;
exports.p = p;
exports.li = li;
