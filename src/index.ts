import Vector from "./Vector/Vector";
import Stack from "./Stack/Stack";
import Queue from "./Queue/Queue";
import LinkList from "./LinkList/LinkList";
import Deque from "./Deque/Deque";
import PriorityQueue from "./PriorityQueue/PriorityQueue";
import Set from "./Set/Set";
import Map from "./Map/Map";
import HashSet from "./HashSet/HashSet";
import HashMap from "./HashMap/HashMap";

if (typeof Symbol.iterator !== 'symbol') {
    console.warn("Your running environment does not support symbol type, you may can not use the 'for...of' syntax.");
}

export {
    Vector,
    Stack,
    Queue,
    LinkList,
    Deque,
    PriorityQueue,
    Set,
    Map,
    HashSet,
    HashMap
};
