
/**
 * @typedef {{requireProvider:function(string)}}
 */
var OpenmixConfiguration;

/**
 * @typedef {{
 *      market:string,
 *      country:string,
 *      asn:number,
 *      ip_address:string,
 *      hostname_prefix:string,
 *      getProbe:function(string):!Object.<string,{avail: number}>,
 *      getData:function(string):!Object.<string,string>
 *  }}
 */
var OpenmixRequest;

/**
 * @typedef {{
 *      addCName:function(string),
 *      addARecord:function(string),
 *      respond:function(string,string),
 *      addProviderHost:(function(string, string)|function(string, string, string)),
 *      setStatus:function(number),
 *      setProvider:function(string),
 *      setTTL:function(number),
 *      setReasonCode:function(string)
 * }}
 */
var OpenmixResponse;
