{
    up:{
        create_table:{
            name:'productions',
            columns:[
                {name:'name', type:'string',null:false},
                {name:'description', type:'text'},
                {name:"price", type:"money", null:false, def:0.00}
             ],
            timestamps:true
         }
    }
}