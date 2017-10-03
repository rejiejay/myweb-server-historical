const dynamic = require('./model');

module.exports = async (ctx, next) => {
	let postData = ctx.request.body;
	// {
	// 	id: '59d2e5dbf8ec5014ecfa4f1e'
	//  isReduce: true
	// }

	if (ctx.is('application/json') === false) {
		ctx.body = {
			'result': 0,
			'data': null,
			'message': 'you post method is mistaken'
		};
		return
	}

	if (inspect(postData) === false) {
		ctx.body = {
			'result': 0,
			'data': null,
			'message': 'you post data form is mistaken'
		};
		return
	}

	let myThoughtsCount,
		isReduce = postData.isReduce || false;
	await findThoughtsCountById(postData.id)
		.then((data) => {
			myThoughtsCount = data.thoughtsCount;
		}, function (error) {
			ctx.body = {
				'result': 0,
				'data': null,
				'message': `Database query thoughtsCount by id is failure, The reason is: ${error}`
			};
			myThoughtsCount = false;
		});

	if (myThoughtsCount === false) { return }

	if (isReduce) {
		if (myThoughtsCount <= 0) {
			ctx.body = {
				'result': 0,
				'data': null,
				'message': `you thoughtsCount can not reduce`
			};
			return
		} else {
			myThoughtsCount--;
		}
	} else {
		myThoughtsCount++;
	}

	let myUpdate =  new Promise((resolve, reject) => {
		dynamic.updateOne({
			_id: postData.id
		}, {
			$set : {
				thoughtsCount: myThoughtsCount
			}
		}, (error, docs) => {
			if (error) {
				reject(error);
			} else {
				resolve(docs);
			}
		});
	});

	let timeout = new Promise((resolve, reject) => {
		setTimeout(reject, 10000, 'Update thoughtsCount to the database time is out');
	})

	await Promise.race([myUpdate, timeout]).then((data) => {
		ctx.body = {
			'result': 1,
			'data': null,
			'message': 'Update thoughtsCount to Database success'
		};
	}, function (error) {
		ctx.body = {
			'result': 0,
			'data': null,
			'message': 'Update thoughtsCount to Database error, The reason code is: ' + error
		};
	});
};


let inspect = (data) => {
	let inspectTarget = data.id || '';

	if (!inspectTarget) {
		return false
	}

	if (typeof inspectTarget === 'string') {
		return true
	} else {
		return false
	}
}

let findThoughtsCountById = async (id) => {
    let myQuery = new Promise((resolve, reject) => {
        dynamic.findOne({_id: id}, (error, docs) => {
            if (error) {
                reject(error);
            }
            resolve(docs);
        });
    });

	let timeout = new Promise((resolve, reject) => {
        setTimeout(reject, 10000, "The query time is out");
    });

    return Promise.race([myQuery, timeout]);
}
