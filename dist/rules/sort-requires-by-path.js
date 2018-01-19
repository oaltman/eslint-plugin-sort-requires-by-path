'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = {
  meta: {
    fixable: 'code'
  },

  create: function create(context) {
    var sourceCode = context.getSourceCode();

    var hasRequire = /require\(/;
    var groups = [];
    var previousNode = void 0;

    var changeOrder = function changeOrder(indices, indicesMap) {
      return function (acc, value, originalIndex) {
        var newIndex = indicesMap[originalIndex];
        acc[newIndex] = value;
        return acc;
      };
    };

    var arrayMultisort = function arrayMultisort(sortFn) {
      return function (refArray) {
        for (var _len = arguments.length, others = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          others[_key - 1] = arguments[_key];
        }

        var indices = refArray.map(function (value, index) {
          return index;
        }) // create indices
        .sort(function (a, b) {
          return sortFn(refArray[a], refArray[b]);
        }); // sort according to refArray
        var indicesMap = indices.reduce(function (acc, newIndex, i) {
          return acc[newIndex] = i, acc;
        }, {}); // for fast index lookup
        return [refArray.reduce(changeOrder(indices, indicesMap), [])].concat(_toConsumableArray(others.map(function (other) {
          return other.reduce(changeOrder(indices, indicesMap), []);
        })));
      };
    };

    function isSorted(ary) {
      return ary.every(function (value, idx) {
        return idx === 0 || ary[idx - 1].toLowerCase() <= value.toLowerCase();
      });
    }

    function check(group) {
      var texts = group.map(function (decl) {
        return sourceCode.getText(decl);
      });
      var requireArgs = group.map(function (decl) {
        return decl.declarations[0].init.arguments[0].raw || '';
      });
      if (!isSorted(requireArgs)) {
        var _arrayMultisort = arrayMultisort(function (a, b) {
          var aLower = a.toLowerCase();
          var bLower = b.toLowerCase();
          return aLower < bLower ? -1 : aLower > bLower ? 1 : 0;
        })(requireArgs, texts),
            _arrayMultisort2 = _slicedToArray(_arrayMultisort, 2),
            requireArgsSorted = _arrayMultisort2[0],
            textsSorted = _arrayMultisort2[1];

        context.report({
          loc: { start: group[0].loc.start, end: last(group).loc.end },
          message: 'This group of requires is not sorted',
          fix: function fix(fixer) {
            return fixer.replaceTextRange([group[0].start, last(group).end], textsSorted.join('\n'));
          }
        });
      }
    }

    function last(ary) {
      return ary[ary.length - 1];
    }

    function shouldStartNewGroup(node, previousNode) {
      if (!previousNode) return true;
      if (node.parent !== previousNode.parent) return true;

      var lineOfNode = sourceCode.getFirstToken(node).loc.start.line;
      var lineOfPrev = sourceCode.getLastToken(previousNode).loc.start.line;
      return lineOfNode - lineOfPrev !== 1;
    }

    return {
      VariableDeclaration: function VariableDeclaration(node) {
        if (!hasRequire.test(sourceCode.getText(node))) return;

        if (shouldStartNewGroup(node, previousNode)) {
          groups.push([node]);
        } else {
          last(groups).push(node);
        }

        previousNode = node;
      },
      'Program:exit': function ProgramExit(node) {
        groups.forEach(check);
      }
    };
  }
};