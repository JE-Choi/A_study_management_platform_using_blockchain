import { post } from 'axios';
const DBControl_txn = {
    // InsertTxnInfo
    callInsertTxnInfo : async function(_idx_hash, _txn_hash, _t_hash){
        const url = '/api/insert/txn';
        console.log(_idx_hash, _txn_hash, _t_hash);
        return post(url,  {
            idx_hash : _idx_hash,
            txn_hash: _txn_hash,
            t_hash: _t_hash
        });
    },

    // SelectTxnInfo
    callSelectTxnInfo : async function(_txn_hash){
        const url = '/api/select/txn_hash';
        return post(url,  {
            txn_hash : _txn_hash
        });
    }

    
};
  
export default DBControl_txn;