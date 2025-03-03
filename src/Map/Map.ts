import { ContainerIterator, BaseType, Pair } from "../Base/Base";
import { TreeIterator, TreeNode } from "../Base/Tree";

export interface MapType<K, V> extends BaseType {
    /**
     * @return Iterator pointing to the begin element.
     */
    begin: () => ContainerIterator<Pair<K, V>>;
    /**
     * @return Iterator pointing to the super end like c++.
     */
    end: () => ContainerIterator<Pair<K, V>>;
    /**
     * @return Iterator pointing to the end element.
     */
    rBegin: () => ContainerIterator<Pair<K, V>>;
    /**
     * @return Iterator pointing to the super begin like c++.
     */
    rEnd: () => ContainerIterator<Pair<K, V>>;
    /**
     * @return The first element.
     */
    front: () => Pair<K, V> | undefined;
    /**
     * @return The last element.
     */
    back: () => Pair<K, V> | undefined;
    forEach: (callback: (element: Pair<K, V>, index: number) => void) => void;
    /**
     * @param element The element you want to find.
     * @return Iterator pointing to the element if found, or super end if not found.
     */
    find: (key: K) => ContainerIterator<Pair<K, V>>;
    /**
     * @return An iterator to the first element not less than the given key.
     */
    lowerBound: (key: K) => ContainerIterator<Pair<K, V>>;
    /**
     * @return An iterator to the first element greater than the given key.
     */
    upperBound: (key: K) => ContainerIterator<Pair<K, V>>;
    /**
     * @return An iterator to the first element not greater than the given key.
     */
    reverseLowerBound: (key: K) => ContainerIterator<Pair<K, V>>;
    /**
     * @return An iterator to the first element less than the given key.
     */
    reverseUpperBound: (key: K) => ContainerIterator<Pair<K, V>>;
    /**
     * Gets the key and value of the element at the specified position.
     */
    getElementByPos: (pos: number) => Pair<K, V>;
    /**
     * Gets the value of the element of the specified key.
     */
    getElementByKey: (key: K) => V | undefined;
    /**
     * Insert a new key-value pair or set value by key.
     */
    setElement: (key: K, value: V) => void;
    /**
     * Removes the elements at the specified position.
     */
    eraseElementByPos: (pos: number) => void;
    /**
     * Removes the elements of the specified key.
     */
    eraseElementByKey: (key: K) => void;
    /**
     * @return An iterator point to the next iterator.
     * Removes element by iterator.
     */
    eraseElementByIterator: (iter: ContainerIterator<Pair<K, V>>) => ContainerIterator<Pair<K, V>>;
    /**
     * Union the other Set to self.
     */
    union: (other: MapType<K, V>) => void;
    /**
     * @return The height of the RB-tree.
     */
    getHeight: () => number;
    /**
     * Using for 'for...of' syntax like Array.
     */
    [Symbol.iterator]: () => Generator<Pair<K, V>, void, undefined>;
}

function Map<K, V>(this: MapType<K, V>, container: { forEach: (callback: (element: Pair<K, V>) => void) => void } = [], cmp: (x: K, y: K) => number) {
    cmp = cmp || ((x, y) => {
        if (x < y) return -1;
        if (x > y) return 1;
        return 0;
    });

    let len = 0;
    let root = new TreeNode<K, V>();
    root.color = TreeNode.TreeNodeColorType.black;
    const header = new TreeNode<K, V>();
    header.parent = root;
    root.parent = header;

    this.size = function () {
        return len;
    };

    this.empty = function () {
        return len === 0;
    };

    this.clear = function () {
        len = 0;
        root.key = root.value = undefined;
        root.leftChild = root.rightChild = root.brother = undefined;
        header.leftChild = header.rightChild = undefined;
    };

    this.begin = function () {
        return new TreeIterator(header.leftChild || header, header);
    }

    this.end = function () {
        return new TreeIterator(header, header);
    }

    this.rBegin = function () {
        return new TreeIterator(header.rightChild || header, header);
    }

    this.rEnd = function () {
        return new TreeIterator(header, header);
    }

    const findSubTreeMinNode: (curNode: TreeNode<K, V>) => TreeNode<K, V> = function (curNode: TreeNode<K, V>) {
        if (!curNode || curNode.key === undefined) throw new Error("unknown error");
        return curNode.leftChild ? findSubTreeMinNode(curNode.leftChild) : curNode;
    };

    const findSubTreeMaxNode: (curNode: TreeNode<K, V>) => TreeNode<K, V> = function (curNode: TreeNode<K, V>) {
        if (!curNode || curNode.key === undefined) throw new Error("unknown error");
        return curNode.rightChild ? findSubTreeMaxNode(curNode.rightChild) : curNode;
    };

    this.front = function () {
        if (this.empty()) return undefined;
        const minNode = header.leftChild;
        if (!minNode || minNode.key === undefined || minNode.value === undefined) throw new Error("unknown error");
        return {
            key: minNode.key,
            value: minNode.value
        };
    };

    this.back = function () {
        if (this.empty()) return undefined;
        const maxNode = header.rightChild;
        if (!maxNode || maxNode.key === undefined || maxNode.value === undefined) throw new Error("unknown error");
        return {
            key: maxNode.key,
            value: maxNode.value
        };
    };

    this.forEach = function (callback: (element: Pair<K, V>, index: number) => void) {
        let index = 0;
        for (const pair of this) callback(pair, index++);
    };

    this.getElementByPos = function (pos: number) {
        if (pos < 0 || pos >= this.size()) throw new Error("pos must more than 0 and less than set's size");
        let index = 0;
        for (const pair of this) {
            if (index === pos) return pair;
            ++index;
        }
        throw new Error("unknown Error");
    };

    const _lowerBound: (curNode: TreeNode<K, V> | undefined, key: K) => TreeNode<K, V> | undefined = (curNode: TreeNode<K, V> | undefined, key: K) => {
        if (!curNode || curNode.key === undefined) return undefined;
        const cmpResult = cmp(curNode.key, key);
        if (cmpResult === 0) return curNode;
        if (cmpResult < 0) return _lowerBound(curNode.rightChild, key);
        const resNode = _lowerBound(curNode.leftChild, key);
        if (resNode === undefined) return curNode;
        return resNode;
    };

    this.lowerBound = function (key: K) {
        const resNode = _lowerBound(root, key);
        return resNode === undefined ? this.end() : new TreeIterator(resNode, header);
    };

    const _upperBound: (curNode: TreeNode<K, V> | undefined, key: K) => TreeNode<K, V> | undefined = (curNode: TreeNode<K, V> | undefined, key: K) => {
        if (!curNode || curNode.key === undefined) return undefined;
        const cmpResult = cmp(curNode.key, key);
        if (cmpResult <= 0) return _upperBound(curNode.rightChild, key);
        const resNode = _upperBound(curNode.leftChild, key);
        if (resNode === undefined) return curNode;
        return resNode;
    };

    this.upperBound = function (key: K) {
        const resNode = _upperBound(root, key);
        return resNode === undefined ? this.end() : new TreeIterator(resNode, header);
    };

    const _reverseLowerBound: (curNode: TreeNode<K, V> | undefined, key: K) => TreeNode<K, V> | undefined = (curNode: TreeNode<K, V> | undefined, key: K) => {
        if (!curNode || curNode.key === undefined) return undefined;
        const cmpResult = cmp(curNode.key, key);
        if (cmpResult === 0) return curNode;
        if (cmpResult > 0) return _reverseLowerBound(curNode.leftChild, key);
        const resNode = _reverseLowerBound(curNode.rightChild, key);
        if (resNode === undefined) return curNode;
        return resNode;
    };

    this.reverseLowerBound = function (key: K) {
        const resNode = _reverseLowerBound(root, key);
        return resNode === undefined ? this.end() : new TreeIterator(resNode, header);
    };

    const _reverseUpperBound: (curNode: TreeNode<K, V> | undefined, key: K) => TreeNode<K, V> | undefined = (curNode: TreeNode<K, V> | undefined, key: K) => {
        if (!curNode || curNode.key === undefined) return undefined;
        const cmpResult = cmp(curNode.key, key);
        if (cmpResult >= 0) return _reverseUpperBound(curNode.leftChild, key);
        const resNode = _reverseUpperBound(curNode.rightChild, key);
        if (resNode === undefined) return curNode;
        return resNode;
    };

    this.reverseUpperBound = function (key: K) {
        const resNode = _reverseUpperBound(root, key);
        return resNode === undefined ? this.end() : new TreeIterator(resNode, header);
    };

    const eraseNodeSelfBalance = function (curNode: TreeNode<K, V>) {
        const parentNode = curNode.parent;
        if (!parentNode || parentNode === header) {
            if (curNode === root) return;
            throw new Error("unknown error");
        }

        if (curNode.color === TreeNode.TreeNodeColorType.red) {
            curNode.color = TreeNode.TreeNodeColorType.black;
            return;
        }

        const brotherNode = curNode.brother;
        if (!brotherNode) throw new Error("unknown error");

        if (curNode === parentNode.leftChild) {
            if (brotherNode.color === TreeNode.TreeNodeColorType.red) {
                brotherNode.color = TreeNode.TreeNodeColorType.black;
                parentNode.color = TreeNode.TreeNodeColorType.red;
                const newRoot = parentNode.rotateLeft();
                if (root === parentNode) {
                    root = newRoot;
                    header.parent = root;
                    root.parent = header;
                }
                eraseNodeSelfBalance(curNode);
            } else if (brotherNode.color === TreeNode.TreeNodeColorType.black) {
                if (brotherNode.rightChild && brotherNode.rightChild.color === TreeNode.TreeNodeColorType.red) {
                    brotherNode.color = parentNode.color;
                    parentNode.color = TreeNode.TreeNodeColorType.black;
                    if (brotherNode.rightChild) brotherNode.rightChild.color = TreeNode.TreeNodeColorType.black;
                    const newRoot = parentNode.rotateLeft();
                    if (root === parentNode) {
                        root = newRoot;
                        header.parent = root;
                        root.parent = header;
                    }
                    curNode.color = TreeNode.TreeNodeColorType.black;
                } else if ((!brotherNode.rightChild || brotherNode.rightChild.color === TreeNode.TreeNodeColorType.black) && brotherNode.leftChild && brotherNode.leftChild.color === TreeNode.TreeNodeColorType.red) {
                    brotherNode.color = TreeNode.TreeNodeColorType.red;
                    if (brotherNode.leftChild) brotherNode.leftChild.color = TreeNode.TreeNodeColorType.black;
                    const newRoot = brotherNode.rotateRight();
                    if (root === brotherNode) {
                        root = newRoot;
                        header.parent = root;
                        root.parent = header;
                    }
                    eraseNodeSelfBalance(curNode);
                } else if ((!brotherNode.leftChild || brotherNode.leftChild.color === TreeNode.TreeNodeColorType.black) && (!brotherNode.rightChild || brotherNode.rightChild.color === TreeNode.TreeNodeColorType.black)) {
                    brotherNode.color = TreeNode.TreeNodeColorType.red;
                    eraseNodeSelfBalance(parentNode);
                }
            }
        } else if (curNode === parentNode.rightChild) {
            if (brotherNode.color === TreeNode.TreeNodeColorType.red) {
                brotherNode.color = TreeNode.TreeNodeColorType.black;
                parentNode.color = TreeNode.TreeNodeColorType.red;
                const newRoot = parentNode.rotateRight();
                if (root === parentNode) {
                    root = newRoot;
                    header.parent = root;
                    root.parent = header;
                }
                eraseNodeSelfBalance(curNode);
            } else if (brotherNode.color === TreeNode.TreeNodeColorType.black) {
                if (brotherNode.leftChild && brotherNode.leftChild.color === TreeNode.TreeNodeColorType.red) {
                    brotherNode.color = parentNode.color;
                    parentNode.color = TreeNode.TreeNodeColorType.black;
                    if (brotherNode.leftChild) brotherNode.leftChild.color = TreeNode.TreeNodeColorType.black;
                    const newRoot = parentNode.rotateRight();
                    if (root === parentNode) {
                        root = newRoot;
                        header.parent = root;
                        root.parent = header;
                    }
                    curNode.color = TreeNode.TreeNodeColorType.black;
                } else if ((!brotherNode.leftChild || brotherNode.leftChild.color === TreeNode.TreeNodeColorType.black) && brotherNode.rightChild && brotherNode.rightChild.color === TreeNode.TreeNodeColorType.red) {
                    brotherNode.color = TreeNode.TreeNodeColorType.red;
                    if (brotherNode.rightChild) brotherNode.rightChild.color = TreeNode.TreeNodeColorType.black;
                    const newRoot = brotherNode.rotateLeft();
                    if (root === brotherNode) {
                        root = newRoot;
                        header.parent = root;
                        root.parent = header;
                    }
                    eraseNodeSelfBalance(curNode);
                } else if ((!brotherNode.leftChild || brotherNode.leftChild.color === TreeNode.TreeNodeColorType.black) && (!brotherNode.rightChild || brotherNode.rightChild.color === TreeNode.TreeNodeColorType.black)) {
                    brotherNode.color = TreeNode.TreeNodeColorType.red;
                    eraseNodeSelfBalance(parentNode);
                }
            }
        }
    };

    const eraseNode = function (curNode: TreeNode<K, V>) {
        let swapNode: TreeNode<K, V> = curNode;
        while (swapNode.leftChild || swapNode.rightChild) {
            if (swapNode.rightChild) {
                swapNode = findSubTreeMinNode(swapNode.rightChild);
                const tmpKey = curNode.key;
                curNode.key = swapNode.key;
                swapNode.key = tmpKey;
                const tmpValue = curNode.value;
                curNode.value = swapNode.value;
                swapNode.value = tmpValue;
                curNode = swapNode;
            }
            if (swapNode.leftChild) {
                swapNode = findSubTreeMaxNode(swapNode.leftChild);
                const tmpKey = curNode.key;
                curNode.key = swapNode.key;
                swapNode.key = tmpKey;
                const tmpValue = curNode.value;
                curNode.value = swapNode.value;
                swapNode.value = tmpValue;
                curNode = swapNode;
            }
        }

        if (swapNode.key === undefined) throw new Error("unknown error");
        if (header.leftChild && header.leftChild.key !== undefined && cmp(header.leftChild.key, swapNode.key) === 0) {
            if (header.leftChild !== root) header.leftChild = header.leftChild?.parent;
            else if (header.leftChild?.rightChild) header.leftChild = header.leftChild?.rightChild;
            else header.leftChild = undefined;
        }
        if (header.rightChild && header.rightChild.key !== undefined && cmp(header.rightChild.key, swapNode.key) === 0) {
            if (header.rightChild !== root) header.rightChild = header.rightChild?.parent;
            else if (header.rightChild?.leftChild) header.rightChild = header.rightChild?.leftChild;
            else header.rightChild = undefined;
        }

        eraseNodeSelfBalance(swapNode);
        if (swapNode) swapNode.remove();
        --len;
        root.color = TreeNode.TreeNodeColorType.black;
    };

    const inOrderTraversal: (curNode: TreeNode<K, V> | undefined, callback: (curNode: TreeNode<K, V>) => boolean) => boolean = function (curNode: TreeNode<K, V> | undefined, callback: (curNode: TreeNode<K, V>) => boolean) {
        if (!curNode || curNode.key === undefined) return false;
        const ifReturn = inOrderTraversal(curNode.leftChild, callback);
        if (ifReturn) return true;
        if (callback(curNode)) return true;
        return inOrderTraversal(curNode.rightChild, callback);
    };

    this.eraseElementByPos = function (pos: number) {
        if (pos < 0 || pos >= len) throw new Error("pos must more than 0 and less than set's size");
        let index = 0;
        inOrderTraversal(root, curNode => {
            if (pos === index) {
                eraseNode(curNode);
                return true;
            }
            ++index;
            return false;
        });
    };

    this.eraseElementByKey = function (key: K) {
        if (this.empty()) return;

        const curNode = findElementPos(root, key);
        if (curNode === undefined || curNode.key === undefined || cmp(curNode.key, key) !== 0) return;

        eraseNode(curNode);
    };

    const findInsertPos: (curNode: TreeNode<K, V>, key: K) => TreeNode<K, V> = function (curNode: TreeNode<K, V>, key: K) {
        if (!curNode || curNode.key === undefined) throw new Error("unknown error");
        const cmpResult = cmp(key, curNode.key);
        if (cmpResult < 0) {
            if (!curNode.leftChild) {
                curNode.leftChild = new TreeNode<K, V>();
                curNode.leftChild.parent = curNode;
                curNode.leftChild.brother = curNode.rightChild;
                if (curNode.rightChild) curNode.rightChild.brother = curNode.leftChild;
                return curNode.leftChild;
            }
            return findInsertPos(curNode.leftChild, key);
        } else if (cmpResult > 0) {
            if (!curNode.rightChild) {
                curNode.rightChild = new TreeNode<K, V>();
                curNode.rightChild.parent = curNode;
                curNode.rightChild.brother = curNode.leftChild;
                if (curNode.leftChild) curNode.leftChild.brother = curNode.rightChild;
                return curNode.rightChild;
            }
            return findInsertPos(curNode.rightChild, key);
        }
        return curNode;
    };

    const insertNodeSelfBalance = function (curNode: TreeNode<K, V>) {
        const parentNode = curNode.parent;
        if (!parentNode || parentNode === header) {
            if (curNode === root) return;
            throw new Error("unknown error");
        }

        if (parentNode.color === TreeNode.TreeNodeColorType.black) return;

        if (parentNode.color === TreeNode.TreeNodeColorType.red) {
            const uncleNode = parentNode.brother;
            const grandParent = parentNode.parent;
            if (!grandParent) throw new Error("unknown error");

            if (uncleNode && uncleNode.color === TreeNode.TreeNodeColorType.red) {
                uncleNode.color = parentNode.color = TreeNode.TreeNodeColorType.black;
                grandParent.color = TreeNode.TreeNodeColorType.red;
                insertNodeSelfBalance(grandParent);
            } else if (!uncleNode || uncleNode.color === TreeNode.TreeNodeColorType.black) {
                if (parentNode === grandParent.leftChild) {
                    if (curNode === parentNode.leftChild) {
                        parentNode.color = TreeNode.TreeNodeColorType.black;
                        grandParent.color = TreeNode.TreeNodeColorType.red;
                        const newRoot = grandParent.rotateRight();
                        if (grandParent === root) {
                            root = newRoot;
                            header.parent = root;
                            root.parent = header;
                        }
                    } else if (curNode === parentNode.rightChild) {
                        const newRoot = parentNode.rotateLeft();
                        if (parentNode === root) {
                            root = newRoot;
                            header.parent = root;
                            root.parent = header;
                        }
                        insertNodeSelfBalance(parentNode);
                    }
                } else if (parentNode === grandParent.rightChild) {
                    if (curNode === parentNode.leftChild) {
                        const newRoot = parentNode.rotateRight();
                        if (parentNode === root) {
                            root = newRoot;
                            header.parent = root;
                            root.parent = header;
                        }
                        insertNodeSelfBalance(parentNode);
                    } else if (curNode === parentNode.rightChild) {
                        parentNode.color = TreeNode.TreeNodeColorType.black;
                        grandParent.color = TreeNode.TreeNodeColorType.red;
                        const newRoot = grandParent.rotateLeft();
                        if (grandParent === root) {
                            root = newRoot;
                            header.parent = root;
                            root.parent = header;
                        }
                    }
                }
            }
        }
    };

    this.setElement = function (key: K, value: V) {
        if (key === null || key === undefined) {
            throw new Error("to avoid some unnecessary errors, we don't suggest you insert null or undefined here");
        }

        if (value === null || value === undefined) {
            this.eraseElementByKey(key);
            return;
        }

        if (this.empty()) {
            ++len;
            root.key = key;
            root.value = value;
            root.color = TreeNode.TreeNodeColorType.black;
            header.leftChild = root;
            header.rightChild = root;
            return;
        }

        const curNode = findInsertPos(root, key);
        if (curNode.key !== undefined && cmp(curNode.key, key) === 0) {
            curNode.value = value;
            return;
        }

        ++len;
        curNode.key = key;
        curNode.value = value;

        if (header.leftChild === undefined || header.leftChild.key === undefined || cmp(header.leftChild.key, key) > 0) {
            header.leftChild = curNode;
        }
        if (header.rightChild === undefined || header.rightChild.key === undefined || cmp(header.rightChild.key, key) < 0) {
            header.rightChild = curNode;
        }

        insertNodeSelfBalance(curNode);
        root.color = TreeNode.TreeNodeColorType.black;
    };

    const findElementPos: (curNode: TreeNode<K, V> | undefined, key: K) => TreeNode<K, V> | undefined = function (curNode: TreeNode<K, V> | undefined, key: K) {
        if (!curNode || curNode.key === undefined) return undefined;
        const cmpResult = cmp(key, curNode.key);
        if (cmpResult < 0) return findElementPos(curNode.leftChild, key);
        else if (cmpResult > 0) return findElementPos(curNode.rightChild, key);
        return curNode;
    };

    this.find = function (key: K) {
        const curNode = findElementPos(root, key);
        if (curNode === undefined || curNode.key === undefined) return this.end();
        return new TreeIterator(curNode, header);
    };

    this.getElementByKey = function (key: K) {
        const curNode = findElementPos(root, key);
        if (curNode?.key === undefined || curNode?.value === undefined) throw new Error("unknown error");
        return curNode.value;
    };

    // waiting for optimization, this is O(mlog(n+m)) algorithm now, but we expect it to be O(mlog(n/m+1)).
    // (https://en.wikipedia.org/wiki/Red%E2%80%93black_tree#Set_operations_and_bulk_operations)
    this.union = function (other: MapType<K, V>) {
        other.forEach(({ key, value }) => this.setElement(key, value));
    };

    this.getHeight = function () {
        if (this.empty()) return 0;
        const traversal: (curNode: TreeNode<K, V> | undefined) => number = function (curNode: TreeNode<K, V> | undefined) {
            if (!curNode) return 1;
            return Math.max(traversal(curNode.leftChild), traversal(curNode.rightChild)) + 1;
        };
        return traversal(root);
    };

    if (typeof Symbol.iterator === 'symbol') {
        const iterationFunc: (curNode: TreeNode<K, V> | undefined) => Generator<Pair<K, V>, void, undefined> = function* (curNode: TreeNode<K, V> | undefined) {
            if (!curNode || curNode.key === undefined || curNode.value === undefined) return;
            yield* iterationFunc(curNode.leftChild);
            yield { key: curNode.key, value: curNode.value };
            yield* iterationFunc(curNode.rightChild);
        };

        this[Symbol.iterator] = function () {
            return iterationFunc(root);
        };
    }

    container.forEach(({ key, value }) => this.setElement(key, value));
}

export default (Map as unknown as { new <K, V>(container?: { forEach: (callback: (element: Pair<K, V>) => void) => void }, cmp?: (x: K, y: K) => number): MapType<K, V> });
