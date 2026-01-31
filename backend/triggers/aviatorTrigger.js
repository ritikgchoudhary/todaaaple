exports = async function () {
    const mongodb = context.services.get("Cluster0");
    const currentBidCollection = mongodb.db("toddapple").collection("newPeriod");
    const bidCollection = mongodb.db("toddapple").collection("history");
    const periodCollection = mongodb.db("toddapple").collection("newPeriodResult");
    const usersCollection = mongodb.db("toddapple").collection("newUsers");
    const priceCollection = mongodb.db("toddapple").collection("newPrice");

  
      
        var color0;
        var color1;
        var color2;
        var color3;
        var number0;
        var number1;
        var number2;
        var number3;
        var bids0 = [];
        var bids1 = [];
        var bids2 = [];
        var bids3 = [];
        var winnersNumber = [];
        var winnersColor = [];
        var winnersViolet = [];
        var winnersWithViolet = [];
        var price0;
        var price1;
        var price2;
        var price3;
      
        price0 = 20000 + Math.floor(Math.random() * 900) + 100;
        number0 = price0 % 10;
        console.log(number0);
        price1 = 20000 + Math.floor(Math.random() * 900) + 100;
        number1 = price1 % 10;
        console.log(number1);
        price2 = 20000 + Math.floor(Math.random() * 900) + 100;
        number2 = price2 % 10;
        console.log(number2);
        price3 = 20000 + Math.floor(Math.random() * 900) + 100;
        number3 = price3 % 10;
        console.log(number3);
        // delete old period
      
        var queryPeriod = await currentBidCollection
          .find()
          .sort({ date: 1 })
          .toArray();
        await currentBidCollection.deleteOne({ _id: queryPeriod[0]._id });
      
        // create new period
        await currentBidCollection.insertOne({
          id: 1,
          manualNumber0: "no",
          manualNumber1: "no",
          manualNumber2: "no",
          manualNumber3: "no",
          date: Date.now(),
          players0: [],
          players1: [],
          players2: [],
          players3: [],
        });
      
        var result = await currentBidCollection.find().sort({ date: 1 }).toArray();
        bids0 = result[0].players0;
        bids1 = result[0].players1;
        bids2 = result[0].players2;
        bids3 = result[0].players3;
      
        if (result[0].manualNumber0 !== "no") {
          number0 = result[0].manualNumber0;
          price0 = 20350 + number0;
        }
        if (result[0].manualNumber1 !== "no") {
          number1 = result[0].manualNumber1;
          price1 = 20350 + number1;
        }
        if (result[0].manualNumber2 !== "no") {
          number2 = result[0].manualNumber2;
          price2 = 20350 + number2;
        }
        if (result[0].manualNumber3 !== "no") {
          number3 = result[0].manualNumber3;
          price3 = 20350 + number3;
        }
      
        //  part 1
      
        if (number0 % 2 === 0) {
          color0 = "Red";
        } else {
          color0 = "Green";
        }
        if (number0 === 0) {
          color0 = "Red Violet";
        }
        if (number0 === 5) {
          color0 = "Green Violet";
        }
      
        //   part 2
      
        if (number1 % 2 === 0) {
          color1 = "Red";
        } else {
          color1 = "Green";
        }
        if (number1 === 0) {
          color1 = "Red Violet";
        }
        if (number1 === 5) {
          color1 = "Green Violet";
        }
      
        //   part 3
      
        if (number2 % 2 === 0) {
          color2 = "Red";
        } else {
          color2 = "Green";
        }
        if (number2 === 0) {
          color2 = "Red Violet";
        }
        if (number2 === 5) {
          color2 = "Green Violet";
        }
      
        //   part 4
      
        if (number3 % 2 === 0) {
          color3 = "Red";
        } else {
          color3 = "Green";
        }
        if (number3 === 0) {
          color3 = "Red Violet";
        }
        if (number3 === 5) {
          color3 = "Green Violet";
        }
      
        // players list game 0
      
        bids0.forEach((doc) => {
          if (doc.bidOn.includes(`${number0}`)) {
            winnersNumber.push({ userId: doc.userId, price: doc.bidAmount });
          }
          if (doc.bidOn.includes(`${color0}`)) {
            winnersColor.push({ userId: doc.userId, price: doc.bidAmount });
          }
          if (color0 === "Red Violet") {
            if (doc.bidOn.includes("Red")) {
              winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
            if (doc.bidOn.includes("Violet")) {
              winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
          }
          if (color0 === "Green Violet") {
            if (doc.bidOn.includes("Green")) {
              winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
            if (doc.bidOn.includes("Violet")) {
              winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
          }
        });
      
        // players list game 1
      
        bids1.forEach((doc) => {
          if (doc.bidOn.includes(`${number1}`)) {
            winnersNumber.push({ userId: doc.userId, price: doc.bidAmount });
          }
          if (doc.bidOn.includes(`${color1}`)) {
            winnersColor.push({ userId: doc.userId, price: doc.bidAmount });
          }
          if (color1 === "Red Violet") {
            if (doc.bidOn.includes("Red")) {
              winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
            if (doc.bidOn.includes("Violet")) {
              winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
          }
          if (color1 === "Green Violet") {
            if (doc.bidOn.includes("Green")) {
              winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
            if (doc.bidOn.includes("Violet")) {
              winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
          }
        });
      
        // players list game 2
      
        bids2.forEach((doc) => {
          if (doc.bidOn.includes(`${number2}`)) {
            winnersNumber.push({ userId: doc.userId, price: doc.bidAmount });
          }
          if (doc.bidOn.includes(`${color2}`)) {
            winnersColor.push({ userId: doc.userId, price: doc.bidAmount });
          }
          if (color2 === "Red Violet") {
            if (doc.bidOn.includes("Red")) {
              winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
            if (doc.bidOn.includes("Violet")) {
              winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
          }
          if (color2 === "Green Violet") {
            if (doc.bidOn.includes("Green")) {
              winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
            if (doc.bidOn.includes("Violet")) {
              winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
          }
        });
      
        // players list game 3
      
        bids3.forEach((doc) => {
          if (doc.bidOn.includes(`${number3}`)) {
            winnersNumber.push({ userId: doc.userId, price: doc.bidAmount });
          }
          if (doc.bidOn.includes(`${color3}`)) {
            winnersColor.push({ userId: doc.userId, price: doc.bidAmount });
          }
          if (color3 === "Red Violet") {
            if (doc.bidOn.includes("Red")) {
              winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
            if (doc.bidOn.includes("Violet")) {
              winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
          }
          if (color3 === "Green Violet") {
            if (doc.bidOn.includes("Green")) {
              winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
            if (doc.bidOn.includes("Violet")) {
              winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
            }
          }
        });
      
        // winners number
      
        winnersNumber.forEach(async (doc) => {
          var commission = (doc.price * 2) / 100;
          var newPrice = doc.price - commission;
          var amount = newPrice * 9;
          var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
      
          await usersCollection.updateOne(
            { id: doc.userId },
            { $inc: { balance: +fixedAmount } }
          );
        });
      
        // winners color
      
        winnersColor.forEach(async (doc) => {
          var commission = (doc.price * 2) / 100;
          var newPrice = doc.price - commission;
          var amount = newPrice * 2;
          var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
          await usersCollection.updateOne(
            { id: doc.userId },
            { $inc: { balance: +fixedAmount } }
          );
        });
      
        // winners with Violet
      
        winnersWithViolet.forEach(async (doc) => {
          var commission = (doc.price * 2) / 100;
          var newPrice = doc.price - commission;
          var amount = newPrice * 1.5;
          var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
          await usersCollection.updateOne(
            { id: doc.userId },
            { $inc: { balance: +fixedAmount } }
          );
        });
      
        //winner Violet
      
        winnersViolet.forEach(async (doc) => {
          var commission = (doc.price * 2) / 100;
          var newPrice = doc.price - commission;
          var amount = newPrice * 4.5;
          var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
          await usersCollection.updateOne(
            { id: doc.userId },
            { $inc: { balance: +fixedAmount } }
          );
        });
      
        var periodResult = await periodCollection.find().sort({ date: -1 }).toArray();
        var newId;
        // creating new series
      
        const date = new Date();
        const localDate = (date / 1000 + 19800) * 1000;
        const newDate = new Date(localDate);
        const day = newDate.getDate();
        const month = newDate.getMonth() + 1;
        const year = newDate.getFullYear();

        const hours = newDate.getHours();
        var minutes;
        var minutesPassed;
        var daySorted;
        var monthSorted;
        var sortMinutes;
        const getMinutes = newDate.getMinutes();
        if (hours < 1) {
          minutes = getMinutes / 3;
          minutes = parseInt(minutes);
        } else {
          minutesPassed = hours * 60;
          minutes = (getMinutes + minutesPassed) / 3;
          minutes = parseInt(minutes);
        }
        sortMinutes = `${minutes}`;
        if(sortMinutes.length === 1){
           sortMinutes = `00${minutes}`;
        }
        if(sortMinutes.length === 2){
          sortMinutes = `0${minutes}`;
        }
      
        
        if (day < 10) {
          daySorted = `0${day}`;
        } else {
          daySorted = `${day}`;
        }
        if (month < 10) {
          monthSorted = `0${month}`;
        } else {
          monthSorted = `${month}`;
        }
        const series = `${daySorted}${monthSorted}${year}${sortMinutes}`;
        newId = parseInt(series);
      
        await periodCollection.insertOne({
          date: Date.now(),
          id: newId,
          number0: number0,
          color0: color0,
          price0: price0,
      
          number1: number1,
          color1: color1,
          price1: price1,
      
          number2: number2,
          color2: color2,
          price2: price2,
      
          number3: number3,
          color3: color3,
          price3: price3,
        });
      
        if (periodResult.length > 479) {
          for (let i = 479; i < periodResult.length; i++) {
            periodCollection
              .deleteOne({ _id: periodResult[i]._id })
              .then((result) => console.log("deleted"))
              .catch((err) => console.log(err));
          }
        }
        await priceCollection.updateOne(
          { id: "green" },
          { id: "green", "0price": 0, "1price": 0, "2price": 0, "3price": 0 }
        );
        await priceCollection.updateOne(
          { id: "violet" },
          { id: "violet", "0price": 0, "1price": 0, "2price": 0, "3price": 0 }
        );
        await priceCollection.updateOne(
          { id: "red" },
          { id: "red", "0price": 0, "1price": 0, "2price": 0, "3price": 0 }
        );
        await priceCollection.updateOne(
          { id: "number" },
          {
            id: "number",
            game0: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            game1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            game2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            game3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          }
        );
      
        // var oldBidHistoryData = [];
        var newBidHistoryData = [];
        const beforBidData = await bidCollection.findOne({ _id: newId });
        if (beforBidData)
          // beforBidData.bid.forEach(doc => {
          //   oldBidHistoryData.push(doc);
          // });
          beforBidData.bid.forEach((doc) => {
            var newAmount = doc.amount - (doc.amount * 2) / 100;
            var status = "Fail";
            var wonAmount = 0;
            var fixedWonAmount = 0;
      
            // game 0
      
            if (doc.game === 0) {
              if (color0 === "Green Violet") {
                if (doc.select.includes("Green")) {
                  status = "Success";
                  wonAmount = newAmount * 1.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
                if (doc.select.includes("Violet")) {
                  status = "Success";
                  wonAmount = newAmount * 4.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
              }
      
              if (color0 === "Red Violet") {
                if (doc.select.includes("Red")) {
                  status = "Success";
                  wonAmount = newAmount * 1.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
                if (doc.select.includes("Violet")) {
                  status = "Success";
                  wonAmount = newAmount * 4.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
              }
      
              if (doc.select.includes(color0)) {
                status = "Success";
                wonAmount = newAmount * 2;
                fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
              }
              if (doc.select.includes(number0)) {
                status = "Success";
                wonAmount = newAmount * 9;
                fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
              }
              newBidHistoryData.push({
                winning: fixedWonAmount,
                result: `${number0} ${color0}`,
                status: status,
                select: doc.select,
                date: doc.date,
                amount: doc.amount,
                period: doc.period,
                userId: doc.userId,
                openPrice: price0,
                game: 0,
              });
            }
      
            // game 1
      
            if (doc.game === 1) {
              if (color1 === "Green Violet") {
                if (doc.select.includes("Green")) {
                  status = "Success";
                  wonAmount = newAmount * 1.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
                if (doc.select.includes("Violet")) {
                  status = "Success";
                  wonAmount = newAmount * 4.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
              }
      
              if (color1 === "Red Violet") {
                if (doc.select.includes("Red")) {
                  status = "Success";
                  wonAmount = newAmount * 1.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
                if (doc.select.includes("Violet")) {
                  status = "Success";
                  wonAmount = newAmount * 4.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
              }
      
              if (doc.select.includes(color1)) {
                status = "Success";
                wonAmount = newAmount * 2;
                fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
              }
              if (doc.select.includes(number1)) {
                status = "Success";
                wonAmount = newAmount * 9;
                fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
              }
              newBidHistoryData.push({
                winning: fixedWonAmount,
                result: `${number1} ${color1}`,
                status: status,
                select: doc.select,
                date: doc.date,
                amount: doc.amount,
                period: doc.period,
                userId: doc.userId,
                openPrice: price1,
                game: 1,
              });
            }
      
            //game 2
      
            if (doc.game === 2) {
              if (color2 === "Green Violet") {
                if (doc.select.includes("Green")) {
                  status = "Success";
                  wonAmount = newAmount * 1.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
                if (doc.select.includes("Violet")) {
                  status = "Success";
                  wonAmount = newAmount * 4.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
              }
      
              if (color2 === "Red Violet") {
                if (doc.select.includes("Red")) {
                  status = "Success";
                  wonAmount = newAmount * 1.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
                if (doc.select.includes("Violet")) {
                  status = "Success";
                  wonAmount = newAmount * 4.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
              }
      
              if (doc.select.includes(color2)) {
                status = "Success";
                wonAmount = newAmount * 2;
                fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
              }
              if (doc.select.includes(number2)) {
                status = "Success";
                wonAmount = newAmount * 9;
                fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
              }
              newBidHistoryData.push({
                winning: fixedWonAmount,
                result: `${number2} ${color2}`,
                status: status,
                select: doc.select,
                date: doc.date,
                amount: doc.amount,
                period: doc.period,
                userId: doc.userId,
                openPrice: price2,
                game: 2,
              });
            }
      
            // game 3
      
            if (doc.game === 3) {
              if (color3 === "Green Violet") {
                if (doc.select.includes("Green")) {
                  status = "Success";
                  wonAmount = newAmount * 1.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
                if (doc.select.includes("Violet")) {
                  status = "Success";
                  wonAmount = newAmount * 4.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
              }
      
              if (color3 === "Red Violet") {
                if (doc.select.includes("Red")) {
                  status = "Success";
                  wonAmount = newAmount * 1.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
                if (doc.select.includes("Violet")) {
                  status = "Success";
                  wonAmount = newAmount * 4.5;
                  fixedWonAmount =
                    Math.round((wonAmount + Number.EPSILON) * 100) / 100;
                }
              }
      
              if (doc.select.includes(color3)) {
                status = "Success";
                wonAmount = newAmount * 2;
                fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
              }
              if (doc.select.includes(number3)) {
                status = "Success";
                wonAmount = newAmount * 9;
                fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
              }
              newBidHistoryData.push({
                winning: fixedWonAmount,
                result: `${number3} ${color3}`,
                status: status,
                select: doc.select,
                date: doc.date,
                amount: doc.amount,
                period: doc.period,
                userId: doc.userId,
                openPrice: price3,
                game: 3,
              });
            }
          });
        if (beforBidData)
          await bidCollection.updateOne({ _id: newId }, { bid: newBidHistoryData });
      };
      