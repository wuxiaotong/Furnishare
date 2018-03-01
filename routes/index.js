var express = require('express');
var router = express.Router();
var multiparty = require("multiparty");
/* GET index page. */
router.get('/', function(req, res,next) {
    res.render('index', { title: 'Express', 
  			furnitureList: [{
  				id: 1,
				UserId: 1,
				price: "100",
				imgUrl: "/images/property/1.jpg",
				name: "Guaranteed Modern Home",
				location: "14 Tottenham Road, London"
			},
			{
  				id: 2,
				UserId: 1,
				price: "200",
				imgUrl: "/images/property/2.jpg",
				name: "123",
				location: "14 Tottenham Road, London"
			},
			{
  				id: 3,
				UserId: 1,
				price: "300",
				imgUrl: "/images/property/3.jpg",
				name: "Guaranteed Modern Home",
				location: "14 Tottenham Road, London"
			}],
			rentFurnitureList: [{
				id: 1,
				UserId: 1,
				price: "100",
				imgUrl: "/images/property/2.jpg",
				name: "Guaranteed Modern Home",
				location: "14 Tottenham Road, London"
			},
			{
				id: 2,
				UserId: 2,
				price: "389",
				imgUrl: "/images/property/3.jpg",
				name: "Guaranteed Modern Home",
				location: "14 Tottenham Road, London"
			},
			{
				id: 3,
				UserId: 3,
				price: "100",
				imgUrl: "/images/property/4.jpg",
				name: "Guaranteed Modern Home",
				location: "14 Tottenham Road, London"
			},
			{
				id: 4,
				UserId: 4,
				price: "400",
				imgUrl: "/images/property/5.jpg",
				name: "Guaranteed Modern Home",
				location: "14 Tottenham Road, London"
			},
			{
				id: 4,
				UserId: 4,
				price: "400",
				imgUrl: "/images/property/5.jpg",
				name: "Guaranteed Modern Home",
				location: "14 Tottenham Road, London"
			}]
	});    // 到达此路径则渲染index文件，并传出title值供 index.html使用

});


router.route("/list").get(function(req,res){
    var Furniture = global.dbHandel.getModel('furniture');
    Furniture.find(function(err, doc) {
        res.render("list",{title:'checkBook', furnitureList: doc});
    });

});

router.route("/checkout").get(function(req,res){
	if(!req.session.user){ 					//到达/home路径首先判断是否已经登录
		req.session.error = "Please Login First"
		res.redirect("/login?id=4");				//未登录则重定向到 /login 路径
	}
    res.render("checkout",{title:'checkout'});

}); 

router.route("/order").get(function(req,res){
    if(!req.session.user){ 					//到达/home路径首先判断是否已经登录
		req.session.error = "Please Login First"
		res.redirect("/login?id=3");				//未登录则重定向到 /login 路径
	}
	var Order = global.dbHandel.getModel('order'),
		Furniture = global.dbHandel.getModel('furniture');
	var furnitures,
    	furnitureList = new Array(),
    	numList = [],
   		count= 0,
   		countOrder = 0, 
   		furnitureLength = 0,
   		furnitureLengthList = [],
   		orderSize;
    var orderList = new Array(),
    	totalPriceList = new Array(),
    	timeList = new Array(),
    	numAll = [];
   
	Order.find({userName: req.session.user.name}, function(err, doc) {
		 if(!doc || doc.length == 0) {
            res.render("order",{title:'order', data: '', totalPrice: 0, timeList: ''});
        } else {
        	orderSize = doc.length;
        	for(var i = 0; i < doc.length; i++ ) {
	            furnitures = doc[i].furnitureSet;
	            furnitures = JSON.parse(furnitures);
	            furnitureLength = 0;
	            timeList.push(doc[i].createTime);
	            for (var furnitureId in furnitures) {
	            	furnitureLength++;
	            }
	            var tmpcount = 0;
	            for (var furnitureId in furnitures) {  
	            	tmpcount++;
	                numList.push(furnitures[furnitureId]);
	                Furniture.findOne({_id: furnitureId}, function (err, doc) {
	                    furnitureList.push(doc);
	                    count++;
	                    if (count == furnitureLengthList[countOrder]) {//保证所有回调都完成才渲染页面
	                    	var totalPrice = 0;
	                        for (var i = 0; i < count; i++) {
	                        	console.log("i:" + i);
	                        	console.log("num:" + numAll[countOrder][i]);
	                        	console.log("price:" + furnitureList[i].price)
	                            furnitureList[i].num = numAll[countOrder][i];
	                            totalPrice += furnitureList[i].num*furnitureList[i].price;
	                        }
	                        orderList.push(furnitureList);
	                        totalPriceList.push(totalPrice);
	                        countOrder++;
	                        count = 0;
	                        furnitureList = [];
	                        
	                    }
	                    if(countOrder == orderSize) {
			            	res.render("order", {title: 'order', data: orderList, totalPrice: totalPriceList, numAll: numAll, timeList: timeList});
			            }
	                });
					if(tmpcount == furnitureLength) {
						furnitureLengthList.push(furnitureLength);
						numAll.push(numList);
						numList = [];
					}
	            }
	            
       		}
        }
    });

}).post(function(req,res){
	var Order = global.dbHandel.getModel('order'),
		Cart = global.dbHandel.getModel('cart'),
		data = req.body,
		userName = req.session.user.name;

	Cart.findOne({userName: userName}, function (err, doc) {
		if(!doc || doc.length == 0) {

		} else {
			data.furnitureSet = doc.furnitureSet;
			data.userName = userName;
			Order.create(data,function(err,doc){
		      	    if (err) {
	                    res.send(500);
	                    console.log(err);
	                } else {
	                	Cart.remove({userName: userName},function(err){
					        if (err) {
					            res.send(500);
					            console.log(err);
					        } else {
					            req.session.error = 'delete the content in the cart';
					            res.send(200);
					        }
					    });
	                    req.session.error = 'successfully create the order';
	                }
		    });
		}
	});
});

router.route("/furnitureUpload").get(function(req,res){
	if(!req.session.user){ 					//到达/home路径首先判断是否已经登录
		req.session.error = "Please Login First"
		res.redirect("/login?id=0");				//未登录则重定向到 /login 路径
	}
	res.render("furnitureUpload",{title:'Furniture List'});
}).post(function(req,res){

    var Furniture = global.dbHandel.getModel('furniture');
	var form = new multiparty.Form({uploadDir: './public/files/images'});
	form.parse(req, function(err, fields, files) {
	    if(err){
	      console.log('parse error: ' + err);
	    } else {
	      console.log(files);
	      console.log(fields);
	      var img = [];
	      for(var i in files) {
	      	  img.push(files[i][0].path);
	      }
	      var data = {
	      	userName: fields.username,
	      	img: img,
	      	price: fields.price,
	      	name: fields.name,
	      	phone: fields.phone,
	      	email: fields.email,
	      	address: fields.address,
	      	description: fields.notes,
	      	type: fields.rent ? "rent" : "sell",
	      };

	      Furniture.create(data,function(err,doc){
	      	    if (err) {
                    res.send(500);
                    console.log(err);
                } else {
                    req.session.error = '家具创建成功！';
                    res.send(200);
                }
	      });
	    }
	 });
});

router.route("/furnitureDetail").get(function(req,res){
	var id = req.url.split("=")[1];
	if(!req.session.user){ 					//到达/home路径首先判断是否已经登录
		req.session.error = "Please Login First"
		res.redirect("/login?id=1");				//未登录则重定向到 /login 路径
	}
	if(!id) {
		res.redirect("/list");				//未登录则重定向到 /login 路径
	} else {
	    var Furniture = global.dbHandel.getModel('furniture');
	    Furniture.findOne({_id: id}, function(err, doc) {
	    	if (err) {
	            res.send(500);
	            req.session.error = '网络异常错误！';
	            console.log(err);
	        } else {
	        	console.log("into here");
	            res.render("furnitureDetail", {data: doc});
	        }
	    });
	}
}).post(function(req,res){
	var id = req.body.id;
	console.log(id);
	res.render("furnitureDetail",{title:'Furniture List'});
});

router.route("/cart").get(function(req,res){
	
	if(!req.session.user){ 					//到达/home路径首先判断是否已经登录
		req.session.error = "Please Login First"
		res.redirect("/login?id=2");				//未登录则重定向到 /login 路径
	}
	var Cart = global.dbHandel.getModel('cart');
	var Furniture = global.dbHandel.getModel('furniture');
	var furnitureList = new Array();
    var numList = new Array();
    var count= 0, furnitureLength = 0;
	Cart.find({userName: req.session.user.name}, function(err, doc) {
		 if(!doc || doc.length == 0) {
            res.render("cart",{title:'cart', data: '', totalPrice: 0});
        } else {
            furnitures = doc[0].furnitureSet;
            if(furnitures == "{}") {
            	res.render("cart",{title:'cart', data: '', totalPrice: 0});
            }
            furnitures = JSON.parse(furnitures);

            for (var furnitureId in furnitures) {
            	furnitureLength++;
            }
            for (var furnitureId in furnitures) {
    
                numList.push({num: furnitures[furnitureId]});
                Furniture.findOne({_id: furnitureId}, function (err, doc) {
                    furnitureList.push(doc);
                    count++;
                    if (count == furnitureLength) {//保证所有回调都完成才渲染页面
                    	var totalPrice = 0;
                        for (var i = 0; i < count; i++) {
                            furnitureList[i].num = numList[i].num;
                            totalPrice += furnitureList[i].num*furnitureList[i].price;
                        }

                        res.render("cart", {title: 'cart', data: furnitureList, totalPrice: totalPrice});

                    }
                });
            }
        }
    });

}).post(function(req,res){
	var Cart = global.dbHandel.getModel('cart');
	//add to cart
	if(req.body.action == "add") {
		var id = req.body.furnitureId, 
			num = req.body.num;
		Cart.findOne({userName: req.session.user.name}, function (err, doc) {
			if(doc) {
				var newFurnitureSet = JSON.parse(doc.furnitureSet);
				if(!newFurnitureSet[id]) {
					newFurnitureSet[id] = 1;
				} else {
					newFurnitureSet[id] += 1;
				}

				doc.furnitureSet = JSON.stringify(newFurnitureSet);
				Cart.update({userName: req.session.user.name}, {$set: doc}, function(err) {
					if(err) {
						res.send(500);
						console.log(err);
					} else {
						req.session.error = "successfully add to cart";
						res.send(200)
					}
				});
			} else {
				var FurnitureSet = {};
				FurnitureSet[id] = 1;
				Cart.create({
					userName: req.session.user.name,
					furnitureSet: JSON.stringify(FurnitureSet)
				}, function(err, doc) {
					if(err) {
						res.send(500);
						console.log(err);
					} else {
						req.session.error = "successfully add to cart";
						res.send(200)
					}
				});
			}
		});
	}
	if(req.body.action == "change") {
		var id = req.body.furnitureId, 
			num = req.body.num;
		Cart.findOne({userName: req.session.user.name}, function (err, doc) {
			if(doc) {
				var newFurnitureSet = JSON.parse(doc.furnitureSet);
				newFurnitureSet[id] = num;
				doc.furnitureSet = JSON.stringify(newFurnitureSet);
				Cart.update({userName: req.session.user.name}, {$set: doc}, function(err) {
					if(err) {
						res.send(500);
						console.log(err);
					} else {
						req.session.error = "successfully add to cart";
						res.send(200)
					}
				});
			} else {
				var FurnitureSet = {};
				FurnitureSet[id] = num;
				Cart.create({
					userName: req.session.user.name,
					furnitureSet: JSON.stringify(FurnitureSet)
				}, function(err, doc) {
					if(err) {
						res.send(500);
						console.log(err);
					} else {
						req.session.error = "successfully add to cart";
						res.send(200)
					}
				});
			}
		});
	}
	if(req.body.action == "delete") {
		var id = req.body.furnitureId;
		Cart.findOne({userName: req.session.user.name}, function (err, doc) {
			if(doc) {
				var newFurnitureSet = JSON.parse(doc.furnitureSet);
				delete newFurnitureSet[id];
				console.log(newFurnitureSet);
				doc.furnitureSet = JSON.stringify(newFurnitureSet);
				Cart.update({userName: req.session.user.name}, {$set: doc}, function(err) {
					if(err) {
						res.send(500);
						console.log(err);
					} else {
						req.session.error = "successfully add to cart";
						res.send(200)
					}
				});
			}
		});
	}
	//res.render("cart",{title:'Furniture List'});
});

/* GET login page. */
router.route("/login").get(function(req,res){    // 到达此路径则渲染login文件，并传出title值供 login.html使用
	res.render("login",{title:'User Login'});
}).post(function(req,res){ 					   // 从此路径检测到post方式则进行post数据的处理操作
	//get User info
	 //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
	var User = global.dbHandel.getModel('user');  
	var uname = req.body.uname;				//获取post上来的 data数据中 uname的值
	User.findOne({name:uname},function(err,doc){   //通过此model以用户名的条件 查询数据库中的匹配信息
		if(err){ 										//错误就返回给原post处（login.html) 状态码为500的错误
			res.send(500);
			console.log(err);
		}else if(!doc){ 								//查询不到用户名匹配信息，则用户名不存在
			req.session.error = '用户名不存在';
			res.send(404);							//	状态码返回404
		//	res.redirect("/login");
		}else{ 
			if(req.body.upwd != doc.password){ 	//查询到匹配用户名的信息，但相应的password属性不匹配
				req.session.error = "密码错误";
				res.send(404);
			//	res.redirect("/login");
			}else{ 									//信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
				req.session.user = doc;
				res.send(200);
			}
		}
	});
});

/* GET register page. */
router.route("/register").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
	res.render("register",{title:'User register'});
}).post(function(req,res){ 
	 //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
	var User = global.dbHandel.getModel('user');
	var uname = req.body.uname;
	var upwd = req.body.upwd;
	User.findOne({name: uname},function(err,doc){   // 同理 /login 路径的处理方式
		if(err){ 
			res.send(500);
			req.session.error =  '网络异常错误！';
			console.log(err);
		}else if(doc){ 
			req.session.error = '用户名已存在！';
			res.send(500);
			console.log(err);
		}else{ 
			User.create({ 							// 创建一组user对象置入model
				name: uname,
				password: upwd
			},function(err,doc){ 
				 if (err) {
                        res.send(500);
                        console.log(err);
                    } else {
                        req.session.error = '用户名创建成功！';
                        res.send(200);
                    }
                  });
		}
	});
});

/* GET home page. */
router.get("/home",function(req,res){ 
	if(!req.session.user){ 					//到达/home路径首先判断是否已经登录
		req.session.error = "请先登录"
		res.redirect("/login");				//未登录则重定向到 /login 路径
	}
	res.render("home",{title:'Home'});         //已登录则渲染home页面
});

/* GET logout page. */
router.get("/logout",function(req,res){    // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
	req.session.user = null;
	req.session.error = null;
	res.redirect("/");
});

module.exports = router;

