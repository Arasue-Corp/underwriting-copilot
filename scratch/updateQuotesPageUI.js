const fs = require('fs');

const path = 'web/src/app/quotes/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetContent = `                  <div className="space-y-2">
                    {detailsQuote.quotes_provided.map((q: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 border border-border rounded-lg bg-emerald-500/5">
                        <div className="flex items-center space-x-3">
                           <FileText className="w-5 h-5 text-emerald-500" />
                           <span className="font-medium">{q.product}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-right">
                           <div>
                             <div className="font-bold text-emerald-600">\${q.premium}</div>
                             {userProfile?.role !== 'AGENT' && (
                               <div className="text-xs text-muted-foreground font-medium">{t.commission}: {q.commission_percentage}%</div>
                             )}
                           </div>
                           <a href={q.file_url} target="_blank" rel="noreferrer" className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20">
                             Descargar
                           </a>
                        </div>
                      </div>
                    ))}
                  </div>`;

const newContent = `                  <div className="space-y-4">
                    {Object.values(
                      detailsQuote.quotes_provided.reduce((acc: any, q: any) => {
                        const product = q.product || 'Unknown';
                        if (!acc[product]) acc[product] = [];
                        acc[product].push(q);
                        return acc;
                      }, {})
                    ).map((group: any, idx: number) => (
                      <div key={idx} className="border border-border rounded-lg bg-emerald-500/5 overflow-hidden">
                        <div className="bg-emerald-500/10 px-4 py-2 border-b border-border flex items-center space-x-2">
                           <FileText className="w-4 h-4 text-emerald-600" />
                           <span className="font-bold text-emerald-700 text-sm uppercase">{group[0].product}</span>
                        </div>
                        <div className="p-3 space-y-3">
                          {group.map((q: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-md border border-border/50">
                              <div className="flex flex-col">
                                {group.length > 1 && <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Opción {i + 1}</span>}
                                <span className="font-semibold text-sm">{q.carrier || t.carrier}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-right">
                                 <div>
                                   <div className="font-bold text-emerald-600">\${q.premium}</div>
                                   {userProfile?.role !== 'AGENT' && (
                                     <div className="text-xs text-muted-foreground font-medium">{t.commission}: {q.commission_percentage}%</div>
                                   )}
                                 </div>
                                 <a href={q.file_url} target="_blank" rel="noreferrer" className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20">
                                   {t.download}
                                 </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>`;

code = code.replace(targetContent, newContent);

fs.writeFileSync(path, code);
console.log('QuotesPage updated!');
