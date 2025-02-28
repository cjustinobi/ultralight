import { readFileSync, writeFileSync } from 'fs'
import { Tree } from '@chainsafe/persistent-merkle-tree'
import { bytesToHex } from '@ethereumjs/util'
import { ssz } from '@lodestar/types'
const data = readFileSync('./scripts/beaconHead.ssz')
let headState = ssz.deneb.BeaconState.deserialize(data)
const json = ssz.deneb.BeaconState.fields.historicalSummaries.toJson(headState.historicalSummaries)
writeFileSync(`./historicalSummaries_slot_${headState.slot}.json`, JSON.stringify(json))
const slot = headState.slot
// Delete headState object because it's huge and will cause OOM issues if you don't GC it
headState = undefined

const gindex = ssz.deneb.BeaconState.getPathInfo(['historicalSummaries'])
const headStateView = ssz.deneb.BeaconState.deserializeToViewDU(data)
const proof = new Tree(headStateView.node).getSingleProof(gindex.gindex)

const historicalSummariesProof = proof.map((witness) => bytesToHex(witness))
writeFileSync(
  `./historicalSummariesStateProof_slot_${slot}.json`,
  JSON.stringify(historicalSummariesProof),
)
