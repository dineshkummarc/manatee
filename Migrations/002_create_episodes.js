{
    up:{
        create_table:{
            name:'episodes',
            columns:[
                {name:'name', type:'string'},
                {name:'description', type:'text'},
                {name:"productionID",type:"int"},
                {name:"releasedAt",type:"date", def:"getdate()"}

             ],
            timestamps:true
         }

    }
}