export default function handler(req,res){ res.setHeader('Cache-Control','no-store'); res.status(200).json({ok:true,app:'HdK Match',version:'0.6.0'}); }
