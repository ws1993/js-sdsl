import { BaseType } from "../Base/Base";

export interface PriorityQueueType<T> extends BaseType {
    /**
     * Inserts element and sorts the underlying container.
     */
    push: (element: T) => void;
    /**
     * Removes the top element.
     */
    pop: () => void;
    /**
     * Accesses the top element.
     */
    top: () => T;
}

function PriorityQueue<T>(this: PriorityQueueType<T>, container: { forEach: (callback: (element: T) => void) => void } = [], cmp: (x: T, y: T) => number) {
    cmp = cmp || ((x, y) => {
        if (x > y) return -1;
        if (x < y) return 1;
        return 0;
    });

    const priorityQueue: T[] = [];
    container.forEach(element => priorityQueue.push(element));
    let len = priorityQueue.length;

    const swap = function (x: number, y: number) {
        if (x < 0 || x >= len) throw new Error("unknown error");
        if (y < 0 || y >= len) throw new Error("unknown error");
        const tmp = priorityQueue[x];
        priorityQueue[x] = priorityQueue[y];
        priorityQueue[y] = tmp;
    };

    const adjust = function (parent: number) {
        if (parent < 0 || parent >= len) throw new Error("unknown error");
        const leftChild = parent * 2 + 1;
        const rightChild = parent * 2 + 2;
        if (leftChild < len && cmp(priorityQueue[parent], priorityQueue[leftChild]) > 0) swap(parent, leftChild);
        if (rightChild < len && cmp(priorityQueue[parent], priorityQueue[rightChild]) > 0) swap(parent, rightChild);
    };

    (() => {
        for (let parent = Math.floor((len - 1) / 2); parent >= 0; --parent) {
            let curParent = parent;
            let curChild = curParent * 2 + 1;
            while (curChild < len) {
                const leftChild = curChild;
                const rightChild = leftChild + 1;
                let minChild = leftChild;
                if (rightChild < len && cmp(priorityQueue[leftChild], priorityQueue[rightChild]) > 0) minChild = rightChild;
                if (cmp(priorityQueue[curParent], priorityQueue[minChild]) <= 0) break;
                swap(curParent, minChild);
                curParent = minChild;
                curChild = curParent * 2 + 1;
            }
        }
    })();

    this.size = function () {
        return len;
    };

    this.empty = function () {
        return len === 0;
    };

    this.clear = function () {
        len = 0;
        priorityQueue.length = 0;
    };

    this.push = function (element: T) {
        priorityQueue.push(element);
        ++len;
        if (len === 1) return;
        let curNode = len - 1;
        while (curNode > 0) {
            const parent = Math.floor((curNode - 1) / 2);
            if (cmp(priorityQueue[parent], element) <= 0) break;
            adjust(parent);
            curNode = parent;
        }
    };

    this.pop = function () {
        if (this.empty()) return;
        if (this.size() === 1) {
            --len;
            return;
        }
        const last = priorityQueue[len - 1];
        --len;
        let parent = 0;
        while (parent < this.size()) {
            const leftChild = parent * 2 + 1;
            const rightChild = parent * 2 + 2;
            if (leftChild >= this.size()) break;
            let minChild = leftChild;
            if (rightChild < this.size() && cmp(priorityQueue[leftChild], priorityQueue[rightChild]) > 0) minChild = rightChild;
            if (cmp(priorityQueue[minChild], last) >= 0) break;
            priorityQueue[parent] = priorityQueue[minChild];
            parent = minChild;
        }
        priorityQueue[parent] = last;
    };

    this.top = function () {
        return priorityQueue[0];
    };
}

export default (PriorityQueue as unknown as { new<T>(container?: { forEach: (callback: (element: T) => void) => void }, cmp?: (x: T, y: T) => number): PriorityQueueType<T> });
