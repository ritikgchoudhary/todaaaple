exports = async function () {
    const mongodb = context.services.get("Cluster0");
    const currentBidCollection = mongodb
      .db("vga3")
      .collection("5minute_period");
    const bidCollection = mongodb
      .db("vga3")
      .collection("5minute_history");
    const periodCollection = mongodb
      .db("vga3")
      .collection("5minute_PeriodResult");
    const usersCollection = mongodb.db("vga3").collection("newUsers");
    const priceCollection = mongodb
      .db("vga3")
      .collection("5minute_price");
    const playHistoryCollection = mongodb
      .db("vga3")
      .collection("playhistories");
    const extraCollection = mongodb.db("vga3").collection("extras");
    const reportsCollection = mongodb.db("vga3").collection("reports");
  
    var color;
  
    var number;
  
    var bids = [];
  
    var winnersNumber = [];
    var winnersColor = [];
    var winnersViolet = [];
    var winnersWithViolet = [];
    var winnersBigSmall = [];
    var price;
  
    price = 9000 + Math.floor(Math.random() * 900) + 100;
  
    //TODO implement auto and manual result
    number = price % 10;
    const isAuto = await extraCollection.findOne({ id: 1 });
  
    if (isAuto.fastParity.auto) {
      function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      }
      const getRed = await priceCollection.findOne({ id: "red" });
      const getGreen = await priceCollection.findOne({ id: "green" });
      const getViolet = await priceCollection.findOne({ id: "violet" });
      const getNumber = await priceCollection.findOne({ id: "number" });
  
      var red = getRed.price * 2;
      var green = getGreen.price * 2;
      var gviolet = getViolet.price * 4.5 + getGreen.price * 1.5;
      var rviolet = getViolet.price * 4.5 + getRed.price * 1.5;
  
      if(red <= green){
        if (red === 0) {
              price = 9000 + Math.floor(Math.random() * 900) + 100;
              number = price % 10;
            } else {
              var arr = [0,2, 4, 6, 8];
              shuffleArray(arr);
              number = arr[0];
              price = 9570 + number;
            }
  
      }else{
        var arr = [1, 3,5, 7, 9];
        shuffleArray(arr);
        number = arr[0];
        price = 9380 + number;
      }
  
      // if (red <= green && red <= gviolet && red <= rviolet) {
      //   if (red === 0) {
      //     price = 9000 + Math.floor(Math.random() * 900) + 100;
      //     number = price % 10;
      //   } else {
      //     var arr = [2, 4, 6, 8];
      //     shuffleArray(arr);
      //     number = arr[0];
      //     price = 9830 + number;
      //   }
      // } else if (green <= red && green <= rviolet && green <= gviolet) {
      //   var arr = [1, 3, 7, 9];
      //   shuffleArray(arr);
      //   number = arr[0];
      //   price = 9830 + number;
      // } else if (rviolet <= red && rviolet <= green && rviolet <= gviolet) {
      //   number = 0;
      //   price = 9830 + number;
      // } else {
      //   number = 5;
      //   price = 9830 + number;
      // }
    }
  
    // delete old period
  
    var queryPeriod = await currentBidCollection
      .find()
      .sort({ date: 1 })
      .toArray();
    await currentBidCollection.deleteOne({ _id: queryPeriod[0]._id });
  
    // create new period
    await currentBidCollection.insertOne({
      id: 1,
      manualNumber: "no",
      date: Date.now(),
      players: [],
    });
  
    var result = await currentBidCollection.find().sort({ date: 1 }).toArray();
    bids = result[0].players;
  
    if (result[0].manualNumber !== "no") {
      number = result[0].manualNumber;
  
      price = 9830 + number;
    }
  
    //  part 1
  
    if (number % 2 === 0) {
      color = "Red";
    } else {
      color = "Green";
    }
    if (number === 0) {
      color = "Red Violet";
    }
    if (number === 5) {
      color = "Green Violet";
    }
  
    // players list game 0
  
    bids.forEach((doc) => {
      if (doc.bidOn.includes(`${number}`)) {
        winnersNumber.push({ userId: doc.userId, price: doc.bidAmount });
      }
      if (doc.bidOn.includes(`${color}`)) {
        winnersColor.push({ userId: doc.userId, price: doc.bidAmount });
      }
      if (color === "Red Violet") {
        if (doc.bidOn.includes("Red")) {
          winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
        }
        if (doc.bidOn.includes("Violet")) {
          winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
        }
      }
      if (color === "Green Violet") {
        if (doc.bidOn.includes("Green")) {
          winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount });
        }
        if (doc.bidOn.includes("Violet")) {
          winnersViolet.push({ userId: doc.userId, price: doc.bidAmount });
        }
      }
      if(number >= 5){
         if(doc.bidOn === 'Big' ){
            winnersBigSmall.push({ userId: doc.userId, price: doc.bidAmount });
         }
      }else{
        if(doc.bidOn === 'Small' ){
            winnersBigSmall.push({ userId: doc.userId, price: doc.bidAmount });
         }
      }
     
    });
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
      minutes = getMinutes / 5;
      minutes = parseInt(minutes);
    } else {
      minutesPassed = hours * 60;
      minutes = (getMinutes + minutesPassed) / 5;
      minutes = parseInt(minutes);
    }
    sortMinutes = `${minutes}`;
    if (sortMinutes.length === 1) {
      sortMinutes = `00${minutes}`;
    }
    if (sortMinutes.length === 2) {
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
    const series = `${year}${monthSorted}${daySorted}${sortMinutes}`;
    newId = parseInt(series);
    var isBig = false;
    if(number >= 5){
       isBig = true 
    }
    await periodCollection.insertOne({
      date: Date.now(),
      id: newId,
      number: number,
      color: color,
      price: price,
      big: isBig
    });
  
    // winners number
  
    winnersNumber.forEach(async (doc) => {
      var commission = (doc.price * 2) / 100;
      var newPrice = doc.price - commission;
      var amount = newPrice * 9;
      var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
  
      const getUser = await usersCollection.updateOne(
        { id: doc.userId },
        { $inc: { balance: +fixedAmount } }
      );
      await playHistoryCollection.updateOne(
        { userId: doc.userId },
        {
          userId: doc.userId,
          $push: {
            history: {
              amount: fixedAmount,
              game: "5minute",
              credit: true,
              date: Date.now(),
              id: newId,
              note: "win",
            },
          },
        },
        { upsert: true }
      );
      await reportsCollection.updateOne(
        { id: "5minute" },
        { $inc: { "states.number": fixedAmount, "states.numberWinner": +1 } },
        {upsert: true}
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
      await playHistoryCollection.updateOne(
        { userId: doc.userId },
        {
          $push: {
            history: {
              amount: fixedAmount,
              game: "5minute",
              credit: true,
              date: Date.now(),
              id: newId,
              note: "win",
            },
          },
        }
      );
      await reportsCollection.updateOne(
        { id: "5minute" },
        { $inc: { "states.color": fixedAmount, "states.colorWinner": +1 } },
        {upsert: true}
      );
    });
  
    //winners BigSmall
    winnersBigSmall.forEach(async (doc) => {
        var commission = (doc.price * 7) / 100;
        var newPrice = doc.price - commission;
        var amount = newPrice * 2;
        var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
        await usersCollection.updateOne(
          { id: doc.userId },
          { $inc: { balance: +fixedAmount } }
        );
        await playHistoryCollection.updateOne(
          { userId: doc.userId },
          {
            $push: {
              history: {
                amount: fixedAmount,
                game: "5minute",
                credit: true,
                date: Date.now(),
                id: newId,
                note: "win",
              },
            },
          }
        );
        await reportsCollection.updateOne(
          { id: "5minute" },
          { $inc: { "states.bigsmall": fixedAmount, "states.bigsmallWinner": +1 } },
          {upsert: true}
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
      await playHistoryCollection.updateOne(
        { userId: doc.userId },
        {
          $push: {
            history: {
              amount: fixedAmount,
              game: "5minute",
              credit: true,
              date: Date.now(),
              id: newId,
              note: "win",
            },
          },
        }
      );
      await reportsCollection.updateOne(
        { id: "5minute" },
        {
          $inc: {
            "states.withViolet": fixedAmount,
            "states.withVioletWinner": +1,
          },
        },
        {upsert: true}
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
      await playHistoryCollection.updateOne(
        { userId: doc.userId },
        {
          $push: {
            history: {
              amount: fixedAmount,
              game: "5minute",
              credit: true,
              date: Date.now(),
              id: newId,
              note: "win",
            },
          },
        }
      );
      await reportsCollection.updateOne(
        { id: "5minute" },
        { $inc: { "states.violet": fixedAmount, "states.violetWinner": +1 } },
        {upsert: true}
      );
    });
    var periodResult = await periodCollection.find().sort({ date: -1 }).toArray();
  
    if (periodResult.length > 100) {
      for (let i = 100; i < periodResult.length; i++) {
        periodCollection
          .deleteOne({ _id: periodResult[i]._id })
          .then((result) => console.log("deleted"))
          .catch((err) => console.log(err));
      }
    }
    await priceCollection.updateOne({ id: "green" }, { id: "green", price: 0 });
    await priceCollection.updateOne({ id: "violet" }, { id: "violet", price: 0 });
    await priceCollection.updateOne({ id: "red" }, { id: "red", price: 0 });
    await priceCollection.updateOne({ id: "small" }, { id: "small", price: 0 },{upsert: true});
    await priceCollection.updateOne({ id: "big" }, { id: "big", price: 0 },{upsert: true});
    await priceCollection.updateOne(
      { id: "number" },
      {
        id: "number",
        game: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
        if(number >= 5){
          if(doc.select === 'Big' ){
            status = "Success";
            wonAmount = newAmount * 2;
            fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
          }
       }else{
         if(doc.select === 'Small' ){
          status = "Success";
          wonAmount = newAmount * 2;
          fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
          }
       }
  
        if (color === "Green Violet") {
          if (doc.select.includes("Green")) {
            status = "Success";
            wonAmount = newAmount * 1.5;
            fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
          }
          if (doc.select.includes("Violet")) {
            status = "Success";
            wonAmount = newAmount * 4.5;
            fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
          }
        }
  
        if (color === "Red Violet") {
          if (doc.select.includes("Red")) {
            status = "Success";
            wonAmount = newAmount * 1.5;
            fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
          }
          if (doc.select.includes("Violet")) {
            status = "Success";
            wonAmount = newAmount * 4.5;
            fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
          }
        }
  
        if (doc.select.includes(color)) {
          status = "Success";
          wonAmount = newAmount * 2;
          fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
        }
        if (doc.select.includes(number)) {
          status = "Success";
          wonAmount = newAmount * 9;
          fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
        }
        newBidHistoryData.push({
          winning: fixedWonAmount,
          result: `${number} ${color}`,
          status: status,
          select: doc.select,
          date: doc.date,
          amount: doc.amount,
          period: doc.period,
          userId: doc.userId,
          openPrice: price,
          game: 0,
        });
      });
    if (beforBidData)
      await bidCollection.updateOne({ _id: newId }, { bid: newBidHistoryData });
  };
  