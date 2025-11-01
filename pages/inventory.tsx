import { fmt } from '../lib/money'
import { useEffect, useState } from 'react'
import AuthGate from '../components/AuthGate'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabaseClient'

type Item = { id:string; user_id:string; sku:string; name:string; unit_cost:number; qty_on_hand:number; created_at:string }

export default function Inventory(){
  const [email, setEmail] = useState<string|null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [msg, setMsg] = useState('')

  async function load(){
    const me = await supabase.auth.getUser()
    setEmail(me.data.user?.email ?? null)
    const { data } = await supabase.from('inventory').select('*').order('created_at', { ascending:false })
    setItems((data as Item[]) || [])
  }
  useEffect(()=>{ load() }, [])

  async function addSingle(e:any){
    e.preventDefault()
    const f = new FormData(e.target)
    await supabase.from('inventory').insert({
      sku: f.get('sku'),
      name: f.get('name'),
      unit_cost: Number(f.get('unit_cost')),
      qty_on_hand: Number(f.get('qty_on_hand'))
    })
    ;(e.target as HTMLFormElement).reset()
    load()
  }

  function parseCSV(text:string){
    const lines = text.trim().split(/\r?\n/)
    const rows = lines.map(l => l.split(',').map(x=>x.trim()))
    // header expected: sku,name,unit_cost,qty_on_hand
    const [h, ...data] = rows
    if(!h || h.length<4) throw new Error('Invalid header. Expected sku,name,unit_cost,qty_on_hand')
    return data.map(r => ({ sku:r[0], name:r[1], unit_cost:Number(r[2]||0), qty_on_hand:Number(r[3]||0) }))
  }

  async function bulkUpload(e:any){
    const file = e.target.files?.[0]
    if(!file) return
    const text = await file.text()
    try{
      const records = parseCSV(text).slice(0, 1000) // limit to 1000 rows per upload
      const { error } = await supabase.from('inventory').insert(records)
      if(error) throw error
      setMsg(`Uploaded ${records.length} items.`)
      load()
    }catch(err:any){
      setMsg(err.message)
    }
  }

  return (
    <AuthGate>
      <Nav email={email} />
      <div className="container">
        <div className="card">
          <h2>Add Single Item</h2>
          <form className="row" onSubmit={addSingle}>
            <div style={{gridColumn:'span 3'}}><label>SKU</label><input className="input" name="sku" required/></div>
            <div style={{gridColumn:'span 5'}}><label>Name</label><input className="input" name="name" required/></div>
            <div style={{gridColumn:'span 2'}}><label>Unit Cost</label><input className="input" name="unit_cost" type="number" step="0.01" required/></div>
            <div style={{gridColumn:'span 2'}}><label>Qty</label><input className="input" name="qty_on_hand" type="number" step="1" required/></div>
            <div style={{gridColumn:'span 12'}}><button className="btn">Save</button></div>
          </form>
        </div>

        <div className="card">
          <h2>Bulk Upload (CSV)</h2>
          <input type="file" accept=".csv" onChange={bulkUpload} />
          <p className="small">Expected columns: <code>sku,name,unit_cost,qty_on_hand</code></p>
          {msg && <p className="small">{msg}</p>}
        </div>

        <div className="card">
          <h2>Inventory</h2>
          <table className="table">
            <thead><tr><th>SKU</th><th>Name</th><th>Unit Cost</th><th>Qty</th><th>Value</th><th>Added</th></tr></thead>
            <tbody>
              {items.map(x => (
                <tr key={x.id}><td>{x.sku}</td><td>{x.name}</td><td>{fmt(x.unit_cost)}</td><td>{x.qty_on_hand}</td><td>{fmt(x.unit_cost * x.qty_on_hand)}</td><td>{new Date(x.created_at).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGate>
  )
}
