# Step 4: Copilot fixes missing probe

In this part, we have a server that has 50% probability to quit/deplay upon server starts. We will ask copilot to modify our deployment file and server to include probes.

prompt
```
Our server deployment is currently exhibiting critical performance issues, specifically experiencing inconsistent and unpredictable periods of complete unresponsiveness (appearing offline) leading to frequent container restarts, alongside significant and intermittent delays in processing requests, often resulting in timeouts. This degraded availability and high latency are severely impacting user experience and causing our health probes to consistently fail, indicating underlying inefficiencies or resource bottlenecks in the current deployment configuration.
```
prompt_2
```
I noticed you add liveness probe, please modify my server code to align with the probes, and do not change any existing logic.
```