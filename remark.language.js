/*
Language: remark markdown flavor
Author: Ole Petter Bang <olepbang@gmail.com>
*/

hljs.LANGUAGES.remark = function(){
  return {
    contains: [
      {
        className: 'keyword',
        begin: '^#+[^\n]+',
        relevance: 10
      },
      {
        className: 'comment',
        begin: '^---?'
      },
      { 
        className: 'string',
        begin: '^\\w+:'
      },
      { 
        className: 'literal',
        begin: '\\{\\{', end: '\\}\\}'
      },
      {
        className: 'string',
        begin: '\\.\\w+'
      }
    ]
  };
}();
