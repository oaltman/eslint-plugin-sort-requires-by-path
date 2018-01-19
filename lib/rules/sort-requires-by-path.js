'use strict';

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    const hasRequire = /require\(/;
    const groups = [];
    let previousNode;

		const changeOrder = (indices, indicesMap) => (acc, value, originalIndex) => {
			const newIndex = indicesMap[originalIndex]
			acc[newIndex] = value
			return acc
		}

		const arrayMultisort = (sortFn) => (refArray, ...others) => {
			const indices = refArray
				.map((value, index) => index)  // create indices
				.sort((a, b) => sortFn(refArray[a], refArray[b]))  // sort according to refArray
			const indicesMap = indices.reduce((acc, newIndex, i) => (acc[newIndex] = i, acc), {})  // for fast index lookup
			return [
				refArray.reduce(changeOrder(indices, indicesMap), []),
				...others.map((other) => other.reduce(changeOrder(indices, indicesMap), []))
			]
		}

		function isSorted(ary) {
      return ary.every((value, idx) =>
        idx === 0 || ary[idx - 1].toLowerCase() <= value.toLowerCase()
      );
    }

    function check(group) {
      const texts = group.map(decl => sourceCode.getText(decl));
			const requireArgs = group.map(decl =>
				decl.declarations[0].init.arguments[0].raw || ''
			);
      if (!isSorted(requireArgs)) {
				const [requireArgsSorted, textsSorted] = arrayMultisort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          return aLower < bLower ? -1 : aLower > bLower ? 1 : 0;
				})(requireArgs, texts)
        context.report({
          loc: { start: group[0].loc.start, end: last(group).loc.end },
          message: 'This group of requires is not sorted',
          fix: fixer => fixer.replaceTextRange(
            [group[0].start, last(group).end],
            textsSorted.join('\n')
          ),
        });
      }
    }

    function last(ary) {
      return ary[ary.length - 1];
    }

    function shouldStartNewGroup(node, previousNode) {
      if (!previousNode) return true;
      if (node.parent !== previousNode.parent) return true;

      const lineOfNode = sourceCode.getFirstToken(node).loc.start.line;
      const lineOfPrev = sourceCode.getLastToken(previousNode).loc.start.line;
      return lineOfNode - lineOfPrev !== 1;
    }


    return {
      VariableDeclaration(node) {
        if (!hasRequire.test(sourceCode.getText(node))) return;

        if (shouldStartNewGroup(node, previousNode)) {
          groups.push([node]);
        } else {
          last(groups).push(node);
        }

        previousNode = node;
      },

      'Program:exit'(node) {
        groups.forEach(check);
      },
    };
  },
};
