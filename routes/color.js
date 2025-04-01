var express= require('express')
var router= express.Router()
var pool= require('./pool')

router.post('/add_new_color',function(req,res){
    pool.query('insert into color(categoryid,subcategoryid,productid,size,color) value(?,?,?,?,?)',[req.body.categoryid,req.body.subcategoryid,req.body.productid,req.body.size,req.body.color],function(error,result){
        if(error){
            console.log('xxxxxxxxxx',error)
            return res.status(500).json({status:false})
        }
        else{
            return res.status(200).json({status:true})
        }
    })
})

router.get('/display_all_color',function(req,res){
    pool.query('select cc.*,(select C.categoryname from category C where C.categoryid=cc.categoryid) as cn,(select S.subcategoryname from subcategory S where S.subcategoryid=cc.subcategoryid) as sn,(select P.productname from products P where P.productid=cc.productid) as pn from color cc ',function(error,result){
        if(error){
            console.log('xxxxxxxxxx',error)
            return res.status(500).json({data:''})
        }
        else{
            return res.status(200).json({data:result})
        }
    })
})


router.post('/edit_color_data',function(req,res){
    pool.query('update color set categoryid=?,subcategoryid=?,productid=?,size=?,color=? where colorid=?',[req.body.categoryid,req.body.subcategoryid,req.body.productid,req.body.size,req.body.color,req.body.colorid],function(error,result){
        if(error){
            console.log('xxxxxxxxxx',error)
            return res.status(500).json({status:false})
        }
         else{
            return res.status(200).json({status:true})
        }
    })
})

router.post('/delete_color_data',function(req,res){
    pool.query('delete from color where colorid=?',[req.body.colorid],function(error,result){
        if(error){
            console.log('xxxxxxxxxx',error)
            return res.status(500).json({status:false})
        }
        else{
            return res.status(200).json({status:true})
        }
    })
})


module.exports=router
