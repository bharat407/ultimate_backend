var express= require('express')
var router= express.Router()
var pool= require('./pool')

router.post('/add_new_size',function(req,res){
    pool.query('insert into size(categoryid,subcategoryid,productid,size) value(?,?,?,?)',[req.body.categoryid,req.body.subcategoryid,req.body.productid,req.body.size],function(error,result){
        if(error){
            console.log('xxxxxxxxxx',error)
            return res.status(500).json({status:false})
        }
        else{
            return res.status(200).json({status:true})
        }
    })
})

router.get('/display_all_size', function (req, res) {
    pool.query(`
        SELECT ss.*, 
            (SELECT C.categoryname FROM category C WHERE C.categoryid = ss.categoryid) AS cn,
            (SELECT S.subcategoryname FROM subcategory S WHERE S.subcategoryid = ss.subcategoryid) AS sn,
            (SELECT P.productname FROM products P WHERE P.productid = ss.productid) AS pn 
        FROM size ss
    `, function (error, result) {
        if (error) {
            console.log('xxxxxxxxxx', error);
            return res.status(500).json({ data: '' });
        } else {
            return res.status(200).json({ data: result });
        }
    });
});


router.post('/edit_size_data',function(req,res){
    pool.query('update size set categoryid=?,subcategoryid=?,productid=?,size=? where sizeid=?',[req.body.categoryid,req.body.subcategoryid,req.body.productid,req.body.size,req.body.sizeid],function(error,result){
        if(error){
            console.log('xxxxxxxxxx',error)
            return res.status(500).json({status:false})
        }
        else{
            return res.status(200).json({status:true})
        }
    })
})

router.post('/delete_size_data',function(req,res){
    pool.query('delete from size where sizeid=?',[req.body.sizeid],function(error,result){
        if(error){
            console.log('xxxxxxxxxx',error)
            return res.status(500).json({status:false})
        }
        else{
            return res.status(200).json({status:true})
        }
    })
})

router.post('/fetch_all_size',function(req,res){
    pool.query('select * from size where categoryid=? and subcategoryid=? and productid=?',[req.body.categoryid,req.body.subcategoryid,req.body.productid],function(error,result){
        if(error){
            console.log('xxxxxxxxxxxxxxxxx',error)
            return res.status(500).json({data:''})
        }
        else{
            if(result.length>0)
            { size=JSON.parse(result[0].size) 

              return res.status(200).json({data:size})
            }
            else{
                return res.status(200).json({data:[]})
            }
        }
    })
})


module.exports=router