var APP = APP || {};

//URLs for data retrieval
APP.beersUrl 		= "http://api.brewerydb.com/v2/beers/?"; //all beers
APP.stylesUrl 		= "http://api.brewerydb.com/v2/styles/?"; //all styles
APP.glassesUrl 		= "http://api.brewerydb.com/v2/glassware/?"; //all glass types
APP.searchUrl		= "http://api.brewerydb.com/v2/search/?"; //search by beer
APP.key 			= "&key=773eaa516197f58fc6fbf5448fa99554"; //given key

//Mapping of sorting options to sort funcs
APP.sortingOptions  = [{name: "Beer Name (Asc)",funcIndex: 0},
					  	{name: "Beer Name (Desc)",funcIndex: 1},
					  	{name: "Alcohol by Vol (ABV)", funcIndex: 2},
					  	{name: "Intl Bitterness Unit (IBU)", funcIndex: 3}];

APP.funcMap = [APP.sortByNameAsc,APP.sortByNameDesc,APP.sortByAbv,APP.sortByIbu];

/***************************************************************
* Function: init
* Desc: Kicks off the calls to populate initial results and
		populate search criteria
****************************************************************/
APP.init = function()
{
	//Hold UI input while we're loading the page
	$.blockUI();

	//Populate sorting options
	APP.populateSortingOptions();

	//Request data for the first page of beers, and the styles/glasses
	//for the search dropdowns
	APP.requestData(APP.beersUrl,APP.updateModel);
	APP.requestData(APP.stylesUrl,APP.updateStyles);
	APP.requestData(APP.glassesUrl,APP.updateGlasses);

	//Setup various event handlers
	APP.setupEventHandlers();

	//Setup event listener for "Enter" key, so user doesnt have to always
	//hit the search icon when searching for beers
	document.getElementById('searchTerm').onkeypress = function(e)
	{
    	var keyCode = e.keyCode;
    	if (keyCode == '13')
      		APP.searchByName();
 	}
}

/***************************************************************
* Function: setupEventHandlers
* Desc: Sets up various event handlers on the page, mainly for
		the search buttons
****************************************************************/
APP.setupEventHandlers = function(){

	//Handler for search by name
	$("#searchTermBtn").click(APP.searchByName);

	//Handler for search by style btn
	$("#searchStyleBtn").click(APP.searchByStyle);

	//Handler for search by glass btn
	$("#searchGlassBtn").click(APP.searchByGlass);

	//Handler for ABV
	$("#searchAbvBtn").click(APP.searchByAbvRange);

	//Handler for IBU
	$("#searchIbuBtn").click(APP.searchByIbuRange);

	//Clear filters
	$("#clearFilters").click(APP.clearFilters);

	//Sorting
	$("#sortBy").change(APP.sortResults);
}

/***************************************************************
* Function: populateSortingOptions
* Desc: Populates sort by dropdown
****************************************************************/
APP.populateSortingOptions = function(){

	//Populate dropdown with sorting options
	APP.sortingOptions.forEach(function(sortObj){
		var option = '<option value="'+ sortObj.funcIndex + '">' + sortObj.name + '</option>';
		$('#sortBy').append(option);
	})
}

/***************************************************************
* Function: searchByName
* Desc: Called when user hits the search button
****************************************************************/
APP.searchByName = function(){

	var searchTerm = $("#searchTerm").val();

	//Check validity of search box, return if it contains invalid input
	if(!document.getElementById("searchTerm").checkValidity() || searchTerm == "")
		return;

	$.blockUI();

	//Search for all beers using the search term
	APP.requestData(APP.searchUrl,APP.updateModel,"&type=beer&q=" + searchTerm);
}

/***************************************************************
* Function: clearFilters
* Desc: Clears all user filters and re-loads page
****************************************************************/
APP.clearFilters = function(){

	$.blockUI();

	//Clear all values
	$("#searchTerm").val("");
	$("#styles").val("null");
	$("#glasses").val("null");
	$("#abvStart").val("");
	$("#abvEnd").val("");
	$("#ibuStart").val("");
	$("#ibuEnd").val("");

	//Perform default query
	APP.requestData(APP.beersUrl,APP.updateModel);
}

/***************************************************************
* Function: searchByStyle
* Desc: Called when user hits the Search by Styles button
****************************************************************/
APP.searchByStyle = function(){

	var styleId = $("#styles").val();
	if(styleId == "null")
		return;

	$.blockUI();

	//Get the selected style id and run a query
	APP.requestData(APP.beersUrl,APP.updateModel,"&styleId=" + styleId);
}

/***************************************************************
* Function: searchByGlass
* Desc: Called when user hits the Search by Glasses button
****************************************************************/
APP.searchByGlass = function(){

	var glassId = $("#glasses").val();
	if(glassId == "null")
		return;

	$.blockUI();

	//Get the selected style id and run a query
	APP.requestData(APP.beersUrl,APP.updateModel,"&glasswareId=" + glassId);
}

/***************************************************************
* Function: searchByAbvRange
* Desc: Called when user hits the search button for ABV range
****************************************************************/
APP.searchByAbvRange = function(){

	//Check validity of input items, to see if they pass the requirements
	if(!document.getElementById("abvStart").checkValidity() || !document.getElementById("abvEnd").checkValidity() ||
		$("#abvStart").val() == "" || $("#abvEnd").val() == "")
		return;

	var range = $("#abvStart").val() + "," + $("#abvEnd").val();

	$.blockUI();

	//Search for all beers using the search term
	APP.requestData(APP.beersUrl,APP.updateModel,"&abv=" + range);
}

/***************************************************************
* Function: searchByIbuRange
* Desc: Called when user hits the search button for IBU range
****************************************************************/
APP.searchByIbuRange = function(){

	//Check validity of input items, to see if they pass the requirements
	if(!document.getElementById("ibuStart").checkValidity() || !document.getElementById("ibuEnd").checkValidity() ||
		$("#ibuStart").val() == "" || $("#ibuEnd").val() == "")
		return;

	var range = $("#ibuStart").val() + "," + $("#ibuEnd").val();

	$.blockUI();

	//Search for all beers using the search term
	APP.requestData(APP.beersUrl,APP.updateModel,"&ibu=" + range);
}

APP.sortResults = function(){

	$.blockUI();

	//Get the sort func, recall display results
	APP.displayResults(APP.model.data,APP.determineSortingFunc());
}

/***************************************************************
* Function: requestData
* Desc: Given a URL, makes the GET request and sends data back to
		callback
****************************************************************/
APP.requestData = function(url, callback, params){
	$.ajax({
		url: url,
		data: APP.key + (params || ""),
		type: "GET",
		dataType: "JSON",
		success: callback
	});
}

/***************************************************************
* Function: updateModel
* Desc: Updates the local model dataset, and calls for display
		results
****************************************************************/
APP.updateModel = function(beersData){
	APP.model = beersData;
	APP.model.data = beersData.data;

	APP.displayResults(APP.model.data, APP.determineSortingFunc());
}

/***************************************************************
* Function: updateStyles
* Desc: Populates Styles dropdown with data from API call
****************************************************************/
APP.updateStyles = function(styles){

	$('#styles').append('<option value="' + null + '">' + "Select a Style" + '</option>');

	//Populate dropdown with styles from API call
	styles.data.forEach(function(style){
		var option = '<option value="'+ style.id + '">' + (style.shortName ? style.shortName : style.name) + '</option>';
		$('#styles').append(option);
	})
}

/***************************************************************
* Function: updateGlasses
* Desc: Populates Glasses dropdown with data from API call
****************************************************************/
APP.updateGlasses = function(glasses){

	$('#glasses').append('<option value="' + null + '">' + "Select a Glass Type" + '</option>');

	//Populate dropdown with glasses from API call
	glasses.data.forEach(function(glass){
		var option = '<option value="'+ glass.id + '">' + glass.name + '</option>';
		$('#glasses').append(option);
	})
}

/***************************************************************
* Function: createBeerCard
* Desc: Creates a "card" to idenity a beer, complete with a picture,
		the name, style, and the ABV/IBU info
****************************************************************/
APP.createBeerCard = function(item){

	//Grab the template and dynamically create entries based on the template format
	var template = document.querySelector('#beerInfoCard');
	template.content.querySelector('div#beerName').textContent = item.name;
	template.content.querySelector('div#beerStyle').textContent = item.style;
	template.content.querySelector('div#stats').textContent = item.stats;

	//deep copy of clone, add it to the results area.
	var clone = document.importNode(template.content, true);
	$("#resultsContainer").append(clone);
}

/***************************************************************
* Function: displayResults
* Desc: Handles the result from the API call. Updates the resulting
		count, and for each result, calls the createCard function
		to dynamically insert into the result container.
****************************************************************/
APP.displayResults = function(dataIn,sortFunc){

	var data = dataIn;

	//Clear out current contents
	$("#resultsContainer").empty();
	$("#counts").html(data ? "Displaying top " + data.length + " results" : "No Search Results");

	//Data could be empty, if so, unblock the UI and return
	if(data == undefined)
	{
		$.unblockUI();
		return;
	}

	//Parse each data obj, create a card, and drop into result container.
	data.sort(sortFunc).forEach(function(obj){
		var beerObj = {};
		beerObj.name = obj.nameDisplay;
		beerObj.style = (obj.style ? obj.style.shortName : "NA");
		beerObj.stats = "ABV: " + (obj.abv ? obj.abv : "N/A") + ", IBU: " + (obj.ibu ? obj.ibu : "N/A");
		APP.createBeerCard(beerObj);
	})

	$.unblockUI();
}

/***************************************************************
* Function: Sorting Functions
* Desc: Handle sorting
****************************************************************/
APP.sortByNameAsc = function(a,b){
	return a.nameDisplay - b.nameDisplay;
}

APP.sortByNameDesc = function(a,b){
	return b.nameDisplay - a.nameDisplay;
}

APP.sortByAbv = function(a,b){
	return a.abv - b.abv;
}

APP.sortByIbu = function(a,b){
	return a.ibu - b.ibu;
}

/***************************************************************
* Function: determineSortingFunc
* Desc: Mapping of sortBy dropdown val to sorting function. There
		has to be a better way! I was close to figuring it out, but
		couldn't exactly get it working. So I hacked it this way to
		get the functionality working
****************************************************************/
APP.determineSortingFunc = function(){
	return APP.funcMap[$("#sortBy").val()];
}
