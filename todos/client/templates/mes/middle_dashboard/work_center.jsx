WorkCenter = React.createClass({

  mixins: [ReactMeteorData],

  getMeteorData : function(){
    var accumulative_items = []
    var data_records = DataRecord.find({workcenterCode:this.props.workcenterCode}).fetch();
    // machineFunction = "COUNT" with maximal recordTime , call it LAST
    var last_item = DataRecord.findOne({workcenterCode:this.props.workcenterCode, machineFunction:"COUNT" }, {sort: {recordTime: -1}});
    if (last_item) {
      if (!last_item.startTime) {
        console.warn(['startTime not found or zero for the following record. Might cause problem in calculating:- avg_output, currentEfficiency, todayEfficiency', last_item])
      }
      if (!last_item.workorderNo) {
        console.warn(['workorderNo not found or zero for the following record. Might cause problem in calculating:- accumulativeCount, avg_output, currentEfficiency.', last_item])
      }
      if (!last_item.standardWorkTime) {
        console.warn(['standardWorkTime not found or zero for the following record. Might cause problem in calculating:- currentEfficiency, todayEfficiency.', last_item])
      }

      // Difference gives the milliseconds.
      var seconds_between_last_start_time_and_now = (_Now() - last_item.startTime)/1000

      // sum(dataRecord.Count), condition is dataRecord.workcenterCode = last.workcenterCode and dataRecord.workorderNo = last.workorderNo and dataRecord.recordTime between last.startTime and currentTime and dataRecord.functionCode = "C001" Accumulative Quantity: 累計生產數:
      var accumulativeCount = 0;
      var accumulativeCountRecords = DataRecord.find({workcenterCode:this.props.workcenterCode,workorderNo:last_item.workorderNo,functionCode:"C001",machineFunction:"COUNT",recordTime:{$lte: _Now(), $gte:last_item.startTime}}).fetch()
      accumulativeCountRecords.map(function(record){
        if (record.count) {
          accumulativeCount += record.count;
        }
      });

      // stand output 3600 / last.standardWorkTime Standard output(H): 標準輸出(小時):
      var standard_work_time = 3600 / last_item.standardWorkTime;
      if (standard_work_time) { standard_work_time = standard_work_time.toFixed(2) }

      // (3600 / (currentTime - last.startTime)) * accumulativeCount Average output(H): 平均輸出(小時):
      var avg_output = 0;
      if (accumulativeCount && seconds_between_last_start_time_and_now)
        avg_output = (3600/seconds_between_last_start_time_and_now) * accumulativeCount
      if (avg_output){ avg_output = avg_output.toFixed(2)}

      // accumulativeCount / ((currentTime - last.startTime)  / last.standardWorkTime) , convert to percent.
      var currentEfficiency = 0;
      if (accumulativeCount && seconds_between_last_start_time_and_now && last_item.standardWorkTime){
        currentEfficiency = (accumulativeCount/((seconds_between_last_start_time_and_now)/ last_item.standardWorkTime));
      }
      if (currentEfficiency) { currentEfficiency = (currentEfficiency * 100).toFixed(2) }

      // todayEfficiency "1. Get the record of which workcenterNo is current workcenter, recordTime belong to today (from 0:00 ~ 23:59:59)
      //, functionCode is ""C001"", Grouped by startTime, summarize the Count as ""production quantity"",
      // ""Production quantity"" / standWorkTime as ""Standard Efficiency"", ""Production Quantity"" * (currentTime - startTime ) as as ""Fact Efficiency"" .
      // 2. Summarize the ""Standard Efficiency"" / Summarize the ""Fact Efficiency"" of 1, convert to percent." Today Efficiency: 當天效率:
      
      // Meteor.subscribe('aggregateDataRecords', this.props.workcenterCode);
      // console.log(DataRecord.find().fetch())
      var todayEfficiency = 0;
      var production_quantity = 0;
      if (last_item.standardWorkTime) {
        var records_for_pq = DataRecord.find({workcenterCode:this.props.workcenterCode,recordTime:{ $gte: _DayStart() , $lte: _DayEnd() }, machineFunction:"COUNT"}).fetch()
        var groups_for_today_efficiency = _.groupBy(records_for_pq, function(element){ return element.startTime });
        var actual_efficiency_time = 0;
        var standard_efficiency_time = 0;
        $.each(groups_for_today_efficiency,function(startTime,elements){
          var act_count = 0 // _.reduce(elements, function(count, element){ return count + element.count; }, 0);
          var stand_work_time = 0 // _.reduce(elements, function(count, element){ return count + element.standardWorkTime; }, 0);
          elements.map(function(element){
            act_count += element.count;
            stand_work_time += element.standardWorkTime;
          });
          if (act_count && stand_work_time)
          standard_efficiency_time += (act_count*stand_work_time);
          if (elements[0].startTime)
          actual_efficiency_time +=  ((elements[0].endTime || _Now()) - elements[0].startTime)/1000;
        });
        todayEfficiency = standard_efficiency_time / actual_efficiency_time;
        if (todayEfficiency) { todayEfficiency = (todayEfficiency * 100).toFixed(2) }
      }

      // currentQualityRate accumulativeCount / (accumulativeCount + NGCount) , convert to percent Current Quality Reaching Rate: 當前品質達標率:
      var NGCount = 0
      var currentQualityRate = 0;
      if (accumulativeCount) {
        // machineFunction = "QUALITY" with maximal recordTime, call it LAST2
        var last2_items = DataRecord.find({workcenterCode:this.props.workcenterCode, machineFunction:"QUALITY",recordTime:{ $gte: last_item.startTime , $lte: _Now() }}, {sort: {recordTime: -1}}).fetch();
        // NGCount  sum(last2.Count)
        last2_items.map(function(record){
        if (record.count){
          NGCount += record.count;
          }
        })
        // currentQualityRate accumulativeCount / (accumulativeCount + NGCount) , convert to percent
        currentQualityRate =  accumulativeCount/(accumulativeCount+NGCount);
        if (currentQualityRate){ currentQualityRate = (currentQualityRate * 100).toFixed(2);}
      };

    };

    // todayQualityRate "1.To summerize the count of dataRecord of today and workcenterNo is current workcenter.
    // 2. To summerize the count of dataRecord of today , current workcenter, functionCode is ""C001"". 3. 2 / 1, Convert to percent.
    // " Today Quality Reaching Rate: 當天品質達標率:
    var data_record_count = 0;
    var todays_data_records = DataRecord.find({workcenterCode:this.props.workcenterCode,recordTime:{ $gte:_DayStart(), $lte:_DayEnd() }}).fetch();
    todays_data_records.map(function(element){
      if (element.count) {
        data_record_count += element.count
      }
    });
    var data_record_count_function_code = 0;
    var todays_data_records_with_function_code = DataRecord.find({workcenterCode:this.props.workcenterCode, functionCode:"C001", recordTime:{ $gte:_DayStart(), $lte:_DayEnd() }}).fetch();
    todays_data_records_with_function_code.map(function(element){
      if (element.count) {
        data_record_count_function_code += element.count
      }
    });
    var todayQualityRate = 0;
    if (data_record_count_function_code && data_record_count) {
      todayQualityRate = data_record_count_function_code / data_record_count;
    }
    if (todayQualityRate){todayQualityRate = (todayQualityRate * 100).toFixed(2)}

    return{
      last_item : last_item,
      NGCount : NGCount,
      accumulativeCount : accumulativeCount,
      currentEfficiency : currentEfficiency,
      todayQualityRate : todayQualityRate,
      avg_output : avg_output,
      currentQualityRate : currentQualityRate,
      todayEfficiency : todayEfficiency,
      standard_work_time: standard_work_time,
    }
  },

  getInitialState : function(){
    return{
      show_info : false,
      pos_x : 0,
      pos_y : 0,
    }
  },

  savePosition : function(x_coordinate,y_coordinate){
    if (x_coordinate >= 0 && y_coordinate >= 0) {
      x_coordinate = x_coordinate/this.props.page_width;
      y_coordinate = y_coordinate/this.props.page_height;
      Meteor.call("savePosition",this.props.workcenterCode,x_coordinate,y_coordinate)
    };
  },

  mouseOver : function(x,y){
    this.setState({show_info:true,pos_x:x,pos_y:y});
  },

  mouseOut : function(){
    this.setState({show_info:false});
  },

  render : function(){
    var get_state = function(){
      if (this.data.last_item && (this.data.last_item.status == "WORKING" || this.data.last_item.status == "START") && this.data.avg_output && this.data.last_item.standardWorkTime && (this.data.avg_output < this.data.last_item.standardWorkTime)) {
        var status = 'OTHER';
      } else if (this.data.last_item){
        var status = this.data.last_item.currentStatus;
      }
      var colour = "RED";
      var do_flash = false;
      switch(status) {
        case "ONLINE":
          colour = "GREEN"
          break;
        case "OFFLINE":
          colour = "RED"
          break;
        case "FAULT":
          colour = "RED"
          do_flash = true
          break;
        case "PAUSE":
          colour = "BLUE"
          break;
        case "STOP":
          colour = "GRAY"
          break;
        case "WORKING":
          colour = "GREEN"
          do_flash = true
          break;
        case "START":
          colour = "GREEN"
          do_flash = true
          break;
        case "OTHER":
          colour = "YELLOW"
          do_flash = true
          //OTHER: show the background yellow with flash, this status didn't include in the status column, you must calculate it, if the production
          //efficiency(avg output) is lower than standard production(stand output) effciency then show it.
          //you will get the last status (by get the maximal recordtime of current workcenter and corresponding record) and paint the status on the
          //chart.

      }
      return [colour,do_flash]
    }.bind(this);
    return(
      <div>
        { this.state.show_info && this.data.last_item ? <WorkCenterInfo workcenterCode={this.props.workcenterCode} pos_x={this.state.pos_x} pos_y={this.state.pos_y} info_stats={this.data}/> : '' }
        <Draggable ref="draggable" initialPos={this.props.position} data_attr={this.props.workcenterCode} onChange={this.savePosition} over={this.mouseOver} out = {this.mouseOut} colour={get_state()[0]} do_flash={get_state()[1]} />
      </div>
    )
  }
})
